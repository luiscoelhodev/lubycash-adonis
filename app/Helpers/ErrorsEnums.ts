enum TransferErrors {
  equalCpfs = 'senderCPF and receiverCPF cannot be equal!',
  validation = 'Validation error.',
  senderNotFound = 'Sender not found!',
  receiverNotFound = 'Receiver not found!',
  notEnoughMoney = 'Customer does not have enough money for this transfer!',
  dbInsertion = 'Error in making transfer: DB Insertion failed.'
}

export { TransferErrors }