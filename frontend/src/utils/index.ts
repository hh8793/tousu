export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleString('zh-CN');
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': '#ff9800',
    'analyzing': '#2196f3',
    'auto_replied': '#4caf50',
    'manual_processing': '#e91e63',
    'resolved': '#3f51b5',
    'closed': '#9e9e9e'
  };
  return colors[status] || '#9e9e9e';
};