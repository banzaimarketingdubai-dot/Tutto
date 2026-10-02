import React from 'react'
import { TokenWalletModal } from './TokenWalletModal'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance?: number
  onTopUp?: (amount: number) => void
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <TokenWalletModal
      isOpen={isOpen}
      onClose={onClose}
    />
  )
}

