#!/usr/bin/env python3
"""Convert clean studio portrait bust images into normalized 3D .glb meshes via Hunyuan3D-2."""

import argparse
import os
import shutil
import sys
from pathlib import Path

import fast_simplification
import numpy as np
import trimesh
from gradio_client import Client, handle_file
from PIL import Image

MODELS_DIR = Path(__file__).resolve().parent.parent / "web" / "public" / "models"
ARTIFACT_DIR = Path("/Users/abc/.gemini/antigravity-cli/brain/daae9726-12ac-4749-adf2-0660575f393a")

BUST_SOURCES = {
    "alkindi": ARTIFACT_DIR / "bust_alkindi_1794703760756.jpg",
    "turing": ARTIFACT_DIR / "bust_turing_1794703765591.jpg",
    "shannon": ARTIFACT_DIR / "bust_shannon_1794703765345.jpg",
    "diffie": ARTIFACT_DIR / "bust_diffie_1794703764742.jpg",
    "hellman": ARTIFACT_DIR / "bust_hellman_1794703766389.jpg",
}


def decimate_scene(scene: trimesh.Scene, target_faces: int = 55000) -> trimesh.Scene:
    """Decimate each geometry in the scene to keep WebGL FPS fast while preserving detail."""
    new_scene = trimesh.Scene()
    for name, geom in scene.geometry.items():
        if isinstance(geom, trimesh.Trimesh) and len(geom.faces) > target_faces:
            clean = geom.copy()
            clean.merge_vertices()
            clean.remove_unreferenced_vertices()
            reduction = 1.0 - (target_faces / float(len(clean.faces)))
            reduction = max(0.0, min(0.90, reduction))
            verts, faces = fast_simplification.simplify(
                clean.vertices, clean.faces, target_reduction=reduction
            )
            if len(verts) > 5000 and len(faces) > 5000 and np.max(faces) < len(verts):
                dec = trimesh.Trimesh(vertices=verts, faces=faces, process=False)
                new_scene.add_geometry(dec, node_name=name, geom_name=name)
            else:
                print(f"  Warning: decimation skipped (verts={len(verts)}, faces={len(faces)})")
                new_scene.add_geometry(clean, node_name=name, geom_name=name)
        else:
            new_scene.add_geometry(geom, node_name=name, geom_name=name)
    return new_scene


def render_preview(glb_path: Path, out_dir: Path, key: str) -> None:
    """Render front (+Z) and back (-Z) normal-shaded orthographic previews."""
    scene = trimesh.load(str(glb_path), force="scene")
    mesh = trimesh.util.concatenate(list(scene.geometry.values()))
    v = mesh.vertices
    n = mesh.vertex_normals
    for label, sign in [(f"{key}_front_posZ", 1.0), (f"{key}_back_negZ", -1.0)]:
        img = np.full((400, 400), 255, dtype=np.uint8)
        zbuf = np.full((400, 400), -1e9)
        xs = ((v[:, 0] * sign + 0.45) / 0.90 * 399).astype(int)
        ys = ((0.95 - v[:, 1]) / 0.98 * 399).astype(int)
        zs = v[:, 2] * sign
        nz = np.clip(n[:, 2] * sign, 0.12, 1.0)
        mask = (xs >= 0) & (xs < 400) & (ys >= 0) & (ys < 400)
        for x, y, z, shade in zip(xs[mask], ys[mask], zs[mask], nz[mask]):
            if z > zbuf[y, x]:
                zbuf[y, x] = z
                img[y, x] = int(35 + 195 * shade)
        out_file = out_dir / f"{label}.png"
        Image.fromarray(img).save(out_file)
        print(f"  Preview saved: {out_file}")


def normalize_glb(src_glb: Path, dst_glb: Path, target_height: float = 0.92, rotate_y_180: bool = True) -> None:
    """Center mesh at X=0, Z=0, rest base at Y=0, orient face +Z, and scale height."""
    scene = trimesh.load(str(src_glb), force="scene")
    if rotate_y_180:
        scene.apply_transform(trimesh.transformations.rotation_matrix(np.pi, [0, 1, 0]))
    bounds = scene.bounds
    if bounds is None:
        raise RuntimeError(f"Empty mesh in {src_glb}")

    size = bounds[1] - bounds[0]
    print(f"  Raw bounds min={bounds[0].round(3)} max={bounds[1].round(3)} size={size.round(3)}")

    # Center X and Z, put min Y at 0
    cx = (bounds[0][0] + bounds[1][0]) / 2.0
    cz = (bounds[0][2] + bounds[1][2]) / 2.0
    min_y = bounds[0][1]

    transform = np.eye(4)
    transform[0, 3] = -cx
    transform[1, 3] = -min_y
    transform[2, 3] = -cz
    scene.apply_transform(transform)

    # Scale uniformly so height (Y) == target_height
    height = float(size[1])
    if height > 1e-5:
        scale = target_height / height
        scale_mat = np.eye(4)
        scale_mat[0, 0] = scale
        scale_mat[1, 1] = scale
        scale_mat[2, 2] = scale
        scene.apply_transform(scale_mat)

    new_bounds = scene.bounds
    total_verts = sum(len(g.vertices) for g in scene.geometry.values())
    total_faces = sum(len(g.faces) for g in scene.geometry.values())
    print(
        f"  Normalized bounds min={new_bounds[0].round(3)} max={new_bounds[1].round(3)} "
        f"verts={total_verts} faces={total_faces}"
    )

    dst_glb.parent.mkdir(parents=True, exist_ok=True)
    scene.export(str(dst_glb))
    kb = dst_glb.stat().st_size // 1024
    print(f"  Saved {dst_glb} ({kb} KB)")


def generate_one(client: Client, key: str, img_path: Path, textured: bool = True) -> None:
    """Call Hunyuan3D-2 and export normalized GLB."""
    if not img_path.exists():
        raise FileNotFoundError(f"Missing reference image: {img_path}")

    print(f"[{key}] Sending {img_path.name} to Tencent/Hunyuan3D-2 (textured={textured})...")
    api_name = "/generation_all" if textured else "/shape_generation"
    result = client.predict(
        caption=None,
        image=handle_file(str(img_path)),
        mv_image_front=None,
        mv_image_back=None,
        mv_image_left=None,
        mv_image_right=None,
        steps=30,
        guidance_scale=5.5,
        seed=1234,
        octree_resolution=160,
        check_box_rembg=True,
        num_chunks=8000,
        randomize_seed=False,
        api_name=api_name,
    )

    raw_file = result[1] if textured else result[0]
    stats = result[3] if textured else result[2]
    if isinstance(raw_file, dict):
        raw_path = raw_file.get("value") or raw_file.get("path") or raw_file.get("name")
    else:
        raw_path = raw_file
    glb_path = Path(raw_path)

    print(f"  Hunyuan3D-2 returned: {glb_path.name}, stats={stats}")
    dst_glb = MODELS_DIR / f"bust-{key}.glb"
    normalize_glb(glb_path, dst_glb)
    scratch_dir = ARTIFACT_DIR / "scratch"
    scratch_dir.mkdir(parents=True, exist_ok=True)
    render_preview(dst_glb, scratch_dir, key)


def generate_triposg(client: Client, key: str, img_path: Path, textured: bool = True) -> None:
    """Call VAST-AI/TripoSG and export normalized GLB."""
    if not img_path.exists():
        raise FileNotFoundError(f"Missing reference image: {img_path}")

    print(f"[{key}] Sending {img_path.name} to VAST-AI/TripoSG (textured={textured})...")
    seg_img = client.predict(
        image=handle_file(str(img_path)),
        api_name="/run_segmentation",
    )
    seg_path = seg_img.get("path") or seg_img.get("url") if isinstance(seg_img, dict) else seg_img
    mesh_out = client.predict(
        image=handle_file(str(seg_path)),
        seed=42,
        num_inference_steps=50,
        guidance_scale=7.0,
        simplify=True,
        target_face_num=55000,
        api_name="/image_to_3d",
    )
    if textured:
        try:
            tex_out = client.predict(
                image=handle_file(str(seg_path)),
                mesh_path=handle_file(str(mesh_out)),
                seed=42,
                api_name="/run_texture",
            )
            mesh_out = tex_out
        except Exception as exc:
            print(f"  Texture step failed ({exc}), using untextured sculpted mesh.")

    raw_path = (
        mesh_out.get("value") or mesh_out.get("path") or mesh_out.get("name")
        if isinstance(mesh_out, dict)
        else mesh_out
    )
    glb_path = Path(raw_path)
    dst_glb = MODELS_DIR / f"bust-{key}.glb"
    normalize_glb(glb_path, dst_glb, rotate_y_180=False)
    scratch_dir = ARTIFACT_DIR / "scratch"
    scratch_dir.mkdir(parents=True, exist_ok=True)
    render_preview(dst_glb, scratch_dir, key)


def generate_triposr_local(keys: list[str]) -> None:
    """Run stabilityai/TripoSR locally on Apple Silicon MPS / CPU."""
    import torch
    from scipy import ndimage

    triposr_dir = ARTIFACT_DIR / "scratch" / "TripoSR"
    sys.path.insert(0, str(triposr_dir))
    from tsr.system import TSR
    from tsr.utils import resize_foreground

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"[TripoSR] Loading stabilityai/TripoSR on {device}...")
    model = TSR.from_pretrained(
        "stabilityai/TripoSR",
        config_name="config.yaml",
        weight_name="model.ckpt",
    )
    model.renderer.set_chunk_size(8192)
    model.to(device)

    scratch_dir = ARTIFACT_DIR / "scratch"
    scratch_dir.mkdir(parents=True, exist_ok=True)

    for key in keys:
        img_path = BUST_SOURCES[key]
        print(f"[{key}] Reconstructing 3D bust from {img_path.name}...")
        rgb = Image.open(img_path).convert("RGB")
        arr = np.array(rgb)
        # Background is pure white (#FFFFFF); extract foreground mask cleanly
        fg = np.any(arr < 240, axis=-1)
        fg = ndimage.binary_fill_holes(fg)
        fg = ndimage.binary_erosion(fg, iterations=1)
        fg = ndimage.binary_dilation(fg, iterations=1)
        rgba = np.dstack([arr, (fg * 255).astype(np.uint8)])
        pil_rgba = Image.fromarray(rgba, mode="RGBA")
        pil_rgba = resize_foreground(pil_rgba, 0.85)
        img_np = np.array(pil_rgba).astype(np.float32) / 255.0
        img_np = img_np[:, :, :3] * img_np[:, :, 3:4] + (1.0 - img_np[:, :, 3:4]) * 0.5
        clean_img = Image.fromarray((img_np * 255.0).astype(np.uint8))

        with torch.no_grad():
            try:
                scene_codes = model([clean_img], device=device)
            except Exception as exc:
                print(f"  MPS fallback to CPU ({exc})")
                model.to("cpu")
                scene_codes = model([clean_img], device="cpu")
            meshes = model.extract_mesh(scene_codes, has_vertex_color=True, resolution=224)

        mesh = meshes[0]
        # TripoSR outputs Z-up with front at +X; rotate -90 deg X (Y-up) then +90 deg Y (+Z front)
        mesh.apply_transform(trimesh.transformations.rotation_matrix(-np.pi / 2.0, [1, 0, 0]))
        mesh.apply_transform(trimesh.transformations.rotation_matrix(np.pi / 2.0, [0, 1, 0]))
        tmp_glb = scratch_dir / f"raw_{key}.glb"
        mesh.export(str(tmp_glb))

        dst_glb = MODELS_DIR / f"bust-{key}.glb"
        normalize_glb(tmp_glb, dst_glb, rotate_y_180=False)
        render_preview(dst_glb, scratch_dir, key)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--keys", nargs="*", default=list(BUST_SOURCES.keys()))
    parser.add_argument("--no-texture", action="store_true")
    parser.add_argument("--preview-only", action="store_true")
    parser.add_argument("--backend", choices=["hunyuan", "triposg", "triposr"], default="triposr")
    args = parser.parse_args()

    if args.preview_only:
        scratch_dir = ARTIFACT_DIR / "scratch"
        scratch_dir.mkdir(parents=True, exist_ok=True)
        for key in args.keys:
            glb = MODELS_DIR / f"bust-{key}.glb"
            normalize_glb(glb, glb)
            render_preview(glb, scratch_dir, key)
        return 0

    if args.backend == "triposr":
        generate_triposr_local(args.keys)
        return 0

    space = "VAST-AI/TripoSG" if args.backend == "triposg" else "Tencent/Hunyuan3D-2"
    client = Client(space)
    for key in args.keys:
        if key not in BUST_SOURCES:
            print(f"Unknown key: {key}", file=sys.stderr)
            return 1
        if args.backend == "triposg":
            generate_triposg(client, key, BUST_SOURCES[key], textured=not args.no_texture)
        else:
            generate_one(client, key, BUST_SOURCES[key], textured=not args.no_texture)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
