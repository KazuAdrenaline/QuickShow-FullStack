import i18n from "../i18n";

export const dateFormat = (date) => {
  const lang = i18n.language || "en"; // lấy ngôn ngữ hiện tại của app

  return new Date(date).toLocaleString(lang, {
    weekday: "short",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};
