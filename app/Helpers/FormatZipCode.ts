export function formatZipCode(zipCode: string) {
  return zipCode.replace(/(\d{2}).*(\d{3}).*(\d{3})/g, '$1.$2-$3')
}