enum TransferErrorsEnum {
  equalCpfs = 'senderCPF and receiverCPF cannot be equal!',
  validation = 'Validation error.',
  senderNotFound = 'Sender not found!',
  receiverNotFound = 'Receiver not found!',
  notEnoughMoney = 'Customer does not have enough money for this transfer!',
  dbInsertion = 'Error in making transfer: DB Insertion failed.'
}

enum BecomeACustomerErrorsEnum {
  validation = 'Validation error.',
  hasAlreadyRequested = 'You cannot send multiple requests to become a customer.',
  dbInsertionError = 'Error in storing customer: DB insertion failed.',
  dbSelectError = 'Error in finding this customer created: DB select failed.',
}

enum ListAllCustomersErrorsEnum {
  validation = 'Validation error.',
  dbSelect = 'Error in listing all customers: DB select failed.',
}

enum GetCustomerBankStatementErrorsEnum {
  validation = 'Validation error.',
  notFound = 'Customer not found: CPF is incorrect or this person is not our customer.',
  dbSelect = 'Error in retrieving transfers from DB: select failed.'
}

export { 
  TransferErrorsEnum,
  BecomeACustomerErrorsEnum, 
  ListAllCustomersErrorsEnum, 
  GetCustomerBankStatementErrorsEnum 
}