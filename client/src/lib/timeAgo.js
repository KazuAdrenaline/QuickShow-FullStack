export function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  const units = [
    { limit: 60, name: "giây", divisor: 1 },
    { limit: 3600, name: "phút", divisor: 60 },
    { limit: 86400, name: "giờ", divisor: 3600 },
    { limit: 2592000, name: "ngày", divisor: 86400 },
    { limit: 31104000, name: "tháng", divisor: 2592000 },
    { limit: Infinity, name: "năm", divisor: 31104000 },
  ];

  for (const u of units) {
    if (seconds < u.limit) {
      return `${Math.floor(seconds / u.divisor)} ${u.name} trước`;
    }
  }

  return "vừa xong";
}
