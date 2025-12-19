import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import toast from "react-hot-toast";

const Settings = () => {
  const { user, isLoaded } = useUser();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatar, setAvatar] = useState(user?.imageUrl || "");
  const [avatarFile, setAvatarFile] = useState(null);

  if (!isLoaded) return null;

  // UPDATE PROFILE
  const saveProfile = async () => {
    try {
      let imageUrl = avatar;

      // Nếu người dùng chọn avatar mới
      if (avatarFile) {
        const uploaded = await user.setProfileImage({
          file: avatarFile,
        });

        imageUrl = uploaded.publicUrl;
      }

      await user.update({
        firstName,
        lastName,
        imageUrl,
      });

      toast.success("Cập nhật thông tin thành công!");
    } catch (err) {
      console.log(err);
      toast.error("Lỗi khi cập nhật thông tin");
    }
  };

  return (
    <>
      <Title text1="Cài đặt" text2="Quản trị viên" />

      <div className="relative mt-8 max-w-3xl">
        <BlurCircle top="-50px" left="-50px" />

        {/* PROFILE CARD */}
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">
            Thông tin cá nhân
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <img
              src={avatar}
              className="w-20 h-20 rounded-full object-cover border border-gray-600"
              alt="avatar"
            />

            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setAvatarFile(e.target.files[0]);
                  setAvatar(URL.createObjectURL(e.target.files[0]));
                }}
                className="hidden"
                id="avatar-upload"
              />

              <label
                htmlFor="avatar-upload"
                className="px-4 py-2 bg-primary text-black rounded cursor-pointer hover:bg-primary/80 transition"
              >
                Đổi ảnh đại diện
              </label>
            </div>
          </div>

          {/* Full name */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm">Tên</label>
              <input
                className="w-full mt-1 bg-gray-800 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm">Họ</label>
              <input
                className="w-full mt-1 bg-gray-800 text-white p-2 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
            <label className="text-gray-400 text-sm">Email</label>
            <input
              disabled
              className="w-full mt-1 bg-gray-800 text-gray-400 p-2 rounded border border-gray-600 cursor-not-allowed"
              value={user.primaryEmailAddress.emailAddress}
            />
          </div>

          <button
            onClick={saveProfile}
            className="mt-6 px-5 py-2 bg-primary text-black rounded hover:bg-primary/80 transition"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </>
  );
};

export default Settings;
