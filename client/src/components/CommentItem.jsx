import { useState } from "react";
import { Eye, EyeOff, MoreVertical, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";
import i18n from "../i18n";
import { timeAgo } from "../lib/timeAgo";
import { useTranslation } from "react-i18next";
import ReplyItem from "./ReplyItem";

const CommentItem = ({ comment, user, axios, getToken, loadComments }) => {
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.originalContent);
  const [showMenu, setShowMenu] = useState(false);

  const [replyBox, setReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState(null);

  const isOwner = user && comment.userId === user.id;
  const isNegative = comment.sentiment === "negative";

  /* DELETE */
  const deleteComment = async () => {
    const token = await getToken();
    await axios.delete(`/api/comments/${comment._id}?lang=${i18n.language}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success(t("comment.delete_success"));
    loadComments();
  };

  /* UPDATE */
  const saveEdit = async () => {
    const token = await getToken();
    await axios.put(
      `/api/comments/${comment._id}`,
      { content: editText, lang: i18n.language },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    toast.success(t("comment.update_success"));
    setEditing(false);
    loadComments();
  };

  /* LIKE / DISLIKE */
  const like = async () => {
    const token = await getToken();
    await axios.post(`/api/comments/${comment._id}/like`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadComments();
  };

  const dislike = async () => {
    const token = await getToken();
    await axios.post(`/api/comments/${comment._id}/dislike`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadComments();
  };

  /* SEND REPLY */
  const sendReply = async () => {
    if (!replyText.trim()) return;

    const token = await getToken();
    const form = new FormData();

    form.append("content", replyText);
    form.append("lang", i18n.language);
    if (replyImage) form.append("image", replyImage);

    await axios.post(`/api/comments/${comment._id}/reply`, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    setReplyText("");
    setReplyImage(null);
    setReplyBox(false);
    loadComments();
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
      <div className="flex items-start gap-3">
        <img src={comment.userImage} className="w-10 h-10 rounded-full" />

        <div className="flex-1">
          {/* USER + TIME */}
          <div className="flex items-center gap-2">
            <p className="text-white font-semibold">{comment.userName}</p>
            <p className="text-xs text-gray-400">{timeAgo(comment.createdAt)}</p>

            {isOwner && (
              <div className="relative">
                <MoreVertical
                  size={16}
                  className="text-gray-300 cursor-pointer hover:text-white"
                  onClick={() => setShowMenu(!showMenu)}
                />
                {showMenu && (
                  <div className="absolute bg-gray-700 rounded shadow-lg text-sm z-20">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setShowMenu(false);
                      }}
                      className="px-4 py-2 block hover:bg-gray-600 w-full text-left"
                    >
                      ✏ {t("comment.edit")}
                    </button>

                    <button
                      onClick={deleteComment}
                      className="px-4 py-2 block text-red-300 hover:bg-red-600 w-full text-left"
                    >
                      🗑 {t("comment.delete")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* EDIT MODE */}
          {editing ? (
            <>
              <textarea
                className="w-full mt-3 bg-gray-700 text-white p-2 rounded"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />

              <div className="flex gap-3 mt-2">
                <button className="px-4 py-1 bg-primary text-black rounded" onClick={saveEdit}>
                  {t("comment.save")}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-1 bg-gray-600 text-white rounded"
                >
                  {t("comment.cancel")}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300 mt-3">
                {isNegative && !expanded ? (
                  <span className="text-red-400 font-bold">{t("comment.hidden")}</span>
                ) : (
                  comment.originalContent
                )}
              </p>

              {/* 1 IMAGE ONLY */}
              {comment.imageUrl && (
                <img
                  src={comment.imageUrl}
                  className="w-48 h-48 rounded mt-3 object-cover"
                />
              )}

              {isNegative && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-400"
                >
                  {expanded ? <><EyeOff size={16} /> {t("comment.hide")}</> :
                  <><Eye size={16} /> {t("comment.show")}</>}
                </button>
              )}
            </>
          )}

          {/* LIKE / DISLIKE / REPLY */}
          <div className="flex items-center gap-5 text-gray-300 mt-4">
            <button onClick={like}>👍 {comment.likes?.length}</button>
            <button onClick={dislike}>👎 {comment.dislikes?.length}</button>

            <button
              onClick={() => setReplyBox(!replyBox)}
              className="text-blue-400 hover:underline"
            >
              💬 {t("comment.reply")}
            </button>
          </div>

          {/* REPLY BOX */}
          {replyBox && (
            <div className="mt-3 ml-8">
              <textarea
                className="w-full bg-gray-700 text-white p-2 rounded"
                placeholder={t("comment.reply_placeholder")}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />

              <input
                type="file"
                id={`reply-image-${comment._id}`}
                accept="image/*"
                className="hidden"
                onChange={(e) => setReplyImage(e.target.files[0])}
              />

              <label
                htmlFor={`reply-image-${comment._id}`}
                className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
              >
                📁 {t("comment.choose_file")}
              </label>

              {replyImage && (
                <img
                  src={URL.createObjectURL(replyImage)}
                  className="w-32 h-32 mt-2 object-cover rounded"
                />
              )}

              <button
                onClick={sendReply}
                className="mt-3 px-4 py-1 bg-primary text-black rounded"
              >
                {t("comment.reply")}
              </button>
            </div>
          )}

          {/* REPLIES */}
          {comment.replies?.length > 0 && (
            <div className="mt-4 ml-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-sm text-blue-300 mb-2 hover:underline"
              >
                {expanded ? (
                  <>
                    <ChevronUp size={16} /> {t("comment.hide_replies")}
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />{" "}
                    {t("comment.show_replies", { count: comment.replies.length })}
                  </>
                )}
              </button>

              {expanded && (
                <div className="ml-4 space-y-2">
                  {comment.replies.map((r) => (
                    <ReplyItem
                      key={r._id}
                      reply={r}
                      commentId={comment._id}
                      user={user}
                      axios={axios}
                      getToken={getToken}
                      loadComments={loadComments}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-1">
            {t(`sentiment.${comment.sentiment}`)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
