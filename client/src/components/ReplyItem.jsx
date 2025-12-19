import { useState } from "react";
import { Eye, EyeOff, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import i18n from "../i18n";
import { timeAgo } from "../lib/timeAgo";

const ReplyItem = ({ reply, commentId, user, axios, getToken, loadComments }) => {
  const { t } = useTranslation();

  if (!reply) return null;

  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(reply.originalContent || "");
  const [showMenu, setShowMenu] = useState(false);
  const [editImage, setEditImage] = useState(null);

  const isOwner = user && reply.userId === user.id;
  const isNegative = reply.sentiment === "negative";

  const saveEdit = async () => {
    const token = await getToken();
    const form = new FormData();

    form.append("content", editText);
    form.append("lang", i18n.language);

    if (editImage) form.append("image", editImage);

    await axios.put(
      `/api/comments/${commentId}/reply/${reply._id}`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success(t("comment.update_success"));
    setEditing(false);
    loadComments();
  };

  const deleteReply = async () => {
    const token = await getToken();
    await axios.delete(
      `/api/comments/${commentId}/reply/${reply._id}?lang=${i18n.language}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success(t("comment.delete_success"));
    loadComments();
  };

  const likeReply = async () => {
    const token = await getToken();
    await axios.post(
      `/api/comments/${commentId}/reply/${reply._id}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadComments();
  };

  const dislikeReply = async () => {
    const token = await getToken();
    await axios.post(
      `/api/comments/${commentId}/reply/${reply._id}/dislike`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    loadComments();
  };

  return (
    <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
      <div className="flex items-start gap-3">
        <img src={reply.userImage} className="w-8 h-8 rounded-full" />

        <div className="flex-1">
          {/* USER + TIME */}
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-semibold">{reply.userName}</p>
            <p className="text-xs text-gray-400">{timeAgo(reply.createdAt)}</p>

            {isOwner && (
              <div className="relative">
                <MoreVertical
                  size={16}
                  className="text-gray-300 cursor-pointer hover:text-white"
                  onClick={() => setShowMenu(!showMenu)}
                />

                {showMenu && (
                  <div className="absolute mt-1 bg-gray-700 rounded shadow-lg text-sm z-30">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setShowMenu(false);
                      }}
                      className="block px-4 py-2 hover:bg-gray-600 w-full text-left"
                    >
                      ✏ {t("comment.edit")}
                    </button>

                    <button
                      onClick={deleteReply}
                      className="block px-4 py-2 hover:bg-red-600 text-red-300 w-full text-left"
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
                className="w-full mt-2 bg-gray-600 text-white p-2 rounded"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />

              <input
                type="file"
                accept="image/*"
                className="mt-2 text-white"
                onChange={(e) => setEditImage(e.target.files[0])}
              />

              {editImage && (
                <img
                  src={URL.createObjectURL(editImage)}
                  className="w-20 h-20 rounded object-cover mt-2"
                />
              )}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveEdit}
                  className="px-3 py-1 bg-primary text-black rounded"
                >
                  {t("comment.save")}
                </button>

                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded"
                >
                  {t("comment.cancel")}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-300 text-sm mt-2">
                {isNegative && !expanded ? (
                  <span className="text-red-400 font-bold">
                    {t("comment.hidden")}
                  </span>
                ) : (
                  reply.originalContent
                )}
              </p>

              {reply.imageUrl && (
                <img
                  src={reply.imageUrl}
                  className="w-40 h-40 object-cover rounded mt-2"
                />
              )}

              {isNegative && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-1 flex items-center gap-1 text-xs text-blue-400"
                >
                  {expanded ? (
                    <>
                      <EyeOff size={14} /> {t("comment.hide")}
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> {t("comment.show")}
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {/* LIKE / DISLIKE */}
          <div className="flex items-center gap-5 text-gray-300 mt-3">
            <button
              onClick={likeReply}
              className={`flex items-center gap-1 hover:text-white ${
                reply.likes?.includes(user?.id) ? "text-blue-400" : ""
              }`}
            >
              👍 {reply.likes?.length}
            </button>

            <button
              onClick={dislikeReply}
              className={`flex items-center gap-1 hover:text-white ${
                reply.dislikes?.includes(user?.id) ? "text-red-400" : ""
              }`}
            >
              👎 {reply.dislikes?.length}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {t(`sentiment.${reply.sentiment}`)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
