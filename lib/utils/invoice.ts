
export function calculateInvoiceAmounts({
  amountEntered,
  gstRate,
  isGstInclusive,
}: {
  amountEntered: number
  gstRate?: number | null
  isGstInclusive: boolean
}) {
  let invoiceAmount = amountEntered
  let gstAmount = 0
  let outstandingAmount = amountEntered

  if (!gstRate) {
    return { invoiceAmount, gstAmount: 0, outstandingAmount }
  }

  if (!isGstInclusive) {
    gstAmount = amountEntered * (gstRate / 100)
    outstandingAmount = amountEntered + gstAmount
    return { invoiceAmount, gstAmount, outstandingAmount }
  }

  // GST Inclusive
  const baseAmount = amountEntered / (1 + gstRate / 100)
  gstAmount = amountEntered - baseAmount

  return {
    invoiceAmount: baseAmount,
    gstAmount,
    outstandingAmount: amountEntered,
  }
}
