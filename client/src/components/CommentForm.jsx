import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import i18n from "../i18n";

const CommentForm = ({ movieId, purchased, loadComments }) => {
  const { axios, user, getToken } = useAppContext();
  const { t } = useTranslation();

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [image, setImage] = useState(null);

  const postComment = async () => {
    if (!user) return toast.error(t("comment.login_first"));
    if (!purchased) return toast.error(t("comment.must_purchase"));
    if (!content.trim()) return toast.error(t("comment.error_post"));

    try {
      const token = await getToken();

      const form = new FormData();
      form.append("movieId", movieId);
      form.append("content", content);
      form.append("rating", rating);
      form.append("lang", i18n.language);

      if (image) form.append("image", image);

      const { data } = await axios.post("/api/comments/add", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setContent("");
        setImage(null);
        toast.success(t("comment.post_success"));
        loadComments();
      } else toast.error(data.message);
    } catch (err) {
      toast.error(t("comment.error_post"));
    }
  };

  return (
    <div className="mb-6">
      <textarea
        disabled={!purchased}
        className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700"
        placeholder={t("comment.placeholder")}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <input
        id="comment-image"
        type="file"
        accept="image/*"
        className="hidden"
        disabled={!purchased}
        onChange={(e) => setImage(e.target.files[0])}
      />

      <label
        htmlFor="comment-image"
        className={`mt-2 inline-block px-4 py-2 rounded text-white cursor-pointer ${
          purchased ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600"
        }`}
      >
        📁 {t("comment.choose_file")}
      </label>

      {image && (
        <img
          src={URL.createObjectURL(image)}
          className="w-32 h-32 rounded mt-2 object-cover"
        />
      )}

      <div className="flex items-center mt-3">
        <select
          disabled={!purchased}
          className="bg-gray-800 text-white p-2 rounded border border-gray-700"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r}>{r} ⭐</option>
          ))}
        </select>

        <button
          disabled={!purchased}
          onClick={postComment}
          className="ml-3 px-5 py-2 bg-primary text-black rounded-lg font-semibold"
        >
          {t("comment.post")}
        </button>
      </div>
    </div>
  );
};

export default CommentForm;
