import { useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function SePayTest() {
  const [htmlForm, setHtmlForm] = useState("");
  const { axios, getToken } = useAppContext();

  const handleCreatePayment = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.post(
        "/api/sepay/create",
        {
          showId: "69204d6ce6cefd629a9f17fc", // thay showId thật
          selectedSeats: ["A1"],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("BACKEND:", data);

      if (!data.success) {
        alert("Failed: " + data.message);
        return;
      }

      const { checkoutURL, fields } = data;

      let formHtml = `
        <form id="sepayForm" action="${checkoutURL}" method="POST">
      `;

      Object.keys(fields).forEach((key) => {
        formHtml += `<input type="hidden" name="${key}" value="${fields[key]}" />`;
      });

      formHtml += `</form>`;
      setHtmlForm(formHtml);

      setTimeout(() => {
        document.getElementById("sepayForm").submit();
      }, 200);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">TEST SEPAY</h1>
      <button onClick={handleCreatePayment} className="px-4 py-2 bg-primary text-white rounded-lg">
        Tạo thanh toán thử
      </button>

      <div dangerouslySetInnerHTML={{ __html: htmlForm }}></div>
    </div>
  );
}
