'use client';

import React from 'react';
import { CipherExhibit } from '../../museumData';
import { ClassicalAttackLab } from './ClassicalAttackLab';
import { HistoricalAttackLab } from './HistoricalAttackLab';
import { ModernAttackLab } from './ModernAttackLab';

interface AttackLabViewProps {
  exhibit: CipherExhibit;
  inputText?: string;
  onApplyShift?: (shift: number) => void;
  onApplyAffine?: (a: number, b: number) => void;
  onApplyKey?: (key: string) => void;
}

export function AttackLabView({
  exhibit,
  inputText,
  onApplyShift,
  onApplyAffine,
  onApplyKey,
}: AttackLabViewProps) {
  switch (exhibit.id) {
    case 'caesar':
    case 'affine':
    case 'vigenere':
    case 'substitution':
      return (
        <ClassicalAttackLab
          exhibitId={exhibit.id}
          initialCiphertext={inputText}
          onApplyShift={onApplyShift}
          onApplyAffine={onApplyAffine}
          onApplyKey={onApplyKey}
        />
      );
    case 'enigma':
    case 'lorenz':
      return <HistoricalAttackLab exhibitId={exhibit.id} />;
    case 'aes':
    case 'rsa':
    case 'ecc':
      return <ModernAttackLab exhibitId={exhibit.id} />;
    default:
      return null;
  }
}
