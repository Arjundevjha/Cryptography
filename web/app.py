import sys
import os
from flask import Flask, render_template, request
import string

app = Flask(__name__, template_folder='.')

def generate_caesar_steps(plaintext, shift):
    """Generates the intermediate letters for each character during the Caesar shift."""
    shift %= 26
    steps = []

    for char in plaintext:
        char_steps = []
        if char.isalpha():
            is_upper = char.isupper()
            base = ord('A') if is_upper else ord('a')
            start_idx = ord(char) - base

            # Generate the sequence of letters as they shift
            for step in range(shift + 1):
                curr_idx = (start_idx + step) % 26
                char_steps.append(chr(base + curr_idx))
        else:
            char_steps.append(char)

        steps.append({
            'original': char,
            'steps': char_steps,
            'final': char_steps[-1] if char_steps else char
        })

    return steps

@app.route('/', methods=['GET', 'POST'])
def index():
    steps = None
    original_text = ""
    shift_val = 3

    if request.method == 'POST':
        original_text = request.form.get('plaintext', '')
        try:
            shift_val = int(request.form.get('shift', 3))
        except ValueError:
            shift_val = 3

        if original_text:
            steps = generate_caesar_steps(original_text, shift_val)

    return render_template('index.html', steps=steps, plaintext=original_text, shift=shift_val)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
