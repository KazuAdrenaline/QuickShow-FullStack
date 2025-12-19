import i18n from "../i18n";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";

import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";

const CommentSection = ({ movieId }) => {
  const { axios, user, getToken } = useAppContext();
  const { t } = useTranslation();

  const [comments, setComments] = useState([]);
  const [purchased, setPurchased] = useState(false);
  const [filter, setFilter] = useState("newest");

  /* =====================================================
       LOAD COMMENTS
  ===================================================== */
  const loadComments = async () => {
    try {
      const { data } = await axios.get(
        `/api/comments/${movieId}?lang=${i18n.language}`
      );
      if (data.success) setComments(data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* =====================================================
       CHECK PURCHASED
  ===================================================== */
  const checkPurchased = async () => {
    try {
      if (!user) return setPurchased(false);
      const token = await getToken();
      const { data } = await axios.get(`/api/booking/check/${movieId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchased(data.purchased || false);
    } catch (err) {}
  };

  /* =====================================================
       SORT LOGIC
  ===================================================== */
  const sortedComments = [...comments].sort((a, b) => {
    switch (filter) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "most_liked":
        return (b.likes?.length || 0) - (a.likes?.length || 2);
      case "least_liked":
        return (a.likes?.length || 0) - (b.likes?.length || 0);
      default:
        return 0;
    }
  });

  useEffect(() => {
    loadComments();
    checkPurchased();
  }, [movieId, user, i18n.language]);

  return (
    <div className="bg-gray-900 mt-8 p-6 rounded-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t("comment.title")} ({comments.length})
        </h3>

        {/* FILTER DROPDOWN */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
        >
          <option value="newest">{t("comment.filter_newest")}</option>
          <option value="oldest">{t("comment.filter_oldest")}</option>
          <option value="most_liked">{t("comment.filter_most_liked")}</option>
          <option value="least_liked">{t("comment.filter_least_liked")}</option>
        </select>
      </div>

      {!purchased && (
        <div className="mb-6 p-3 bg-red-900/30 border border-red-700 text-red-300 rounded-lg">
          {t("comment.need_ticket")}
        </div>
      )}

      {/* COMMENT FORM */}
      <CommentForm
        movieId={movieId}
        purchased={purchased}
        loadComments={loadComments}
      />

      {/* COMMENT LIST */}
      <div className="space-y-4 mt-4">
        {sortedComments.map((c) => (
          <CommentItem
            key={c._id}
            comment={c}
            user={user}
            axios={axios}
            getToken={getToken}
            loadComments={loadComments}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
