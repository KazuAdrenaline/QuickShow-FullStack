import Movie from "../models/Movie.js";
import Show from "../models/Show.js";
import Vector from "../models/Vector.js";
import { embed } from "../utils/embed.js";

export const buildIndex = async (req, res) => {
  try {
    console.log("🧹 Đang reset index...");
    await Vector.deleteMany({}); // reset toàn bộ index

    const movies = await Movie.find();
    const shows = await Show.find();

    console.log(`🎬 Tổng số phim: ${movies.length}`);
    console.log(`🎟 Tổng số suất chiếu: ${shows.length}`);

    // =====================================================
    // ⭐ INDEX PHIM (RÚT GỌN – KHÔNG BỊ QUÁ DỮ LIỆU)
    // =====================================================
    for (let m of movies) {
      try {
        const genreList = m.genres
          .map(g => (typeof g === "string" ? g : g.name))
          .join(", ");

        const text = `
Phim: ${m.title}.
Thể loại: ${genreList}.
Thời lượng: ${m.runtime} phút.
Ngày phát hành: ${m.release_date}.
        `.trim();

        const emb = await embed(text);

        await Vector.create({
          type: "movie",
          refId: m._id.toString(),
          content: text,
          embedding: emb,
        });

        console.log("✔ Indexed movie:", m.title);

      } catch (err) {
        console.log("❌ Lỗi khi index phim:", m.title, err.message);
      }
    }

    // =====================================================
    // ⭐ INDEX SUẤT CHIẾU (CŨNG RÚT GỌN)
    // =====================================================
    for (let s of shows) {
      try {
        const movie = await Movie.findById(s.movie);
        if (!movie) {
          console.log("⚠ Không tìm thấy movie cho show:", s._id);
          continue;
        }

        const date = new Date(s.showDateTime).toLocaleDateString("vi-VN");
        const time = new Date(s.showDateTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const text = `
Suất chiếu phim ${movie.title}.
Ngày ${date}.
Giờ ${time}.
Giá vé ${s.showPrice}k.
        `.trim();

        const emb = await embed(text);

        await Vector.create({
          type: "show",
          refId: s._id.toString(),
          content: text,
          embedding: emb,
        });

        console.log("✔ Indexed show:", movie.title, date, time);

      } catch (err) {
        console.log("❌ Lỗi khi index suất chiếu:", s._id, err.message);
      }
    }

    return res.json({
      success: true,
      message: "Index được xây dựng thành công!",
    });

  } catch (error) {
    console.error("🔥 buildIndex error:", error);
    return res.json({ success: false, message: "Lỗi server khi build index." });
  }
};
