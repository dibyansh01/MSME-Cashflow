export function getDaysOverdue(dueDate: Date) {
    const today = new Date()
    const diff = today.getTime() - new Date(dueDate).getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }
  
  export function getAgingBucket(daysOverdue: number) {
    if (daysOverdue <= 0) return 'CURRENT'
    if (daysOverdue <= 30) return '0-30'
    if (daysOverdue <= 60) return '31-60'
    if (daysOverdue <= 90) return '61-90'
    return '90+'
  }
  