import { inngest } from "../inngest/index.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js"
import stripe from 'stripe'


// Function to check availability of selected seats for a movie
const checkSeatsAvailability = async (showId, selectedSeats)=>{
    try {
        const showData = await Show.findById(showId)
        if(!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

        return !isAnySeatTaken;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res)=>{
    try {
        const {userId} = req.auth();
        const {showId, selectedSeats} = req.body;
        const { origin } = req.headers;

        // Check if the seat is available for the selected show
        const isAvailable = await checkSeatsAvailability(showId, selectedSeats)

        if(!isAvailable){
            return res.json({success: false, message: "Selected Seats are not available."})
        }

        // Get the show details
        const showData = await Show.findById(showId).populate('movie');

        // Create a new booking
        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: showData.showPrice * selectedSeats.length,
            bookedSeats: selectedSeats
        })

        selectedSeats.map((seat)=>{
            showData.occupiedSeats[seat] = userId;
        })

        showData.markModified('occupiedSeats');

        await showData.save();

         // Stripe Gateway Initialize
         const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)

         // Creating line items to for Stripe
         const line_items = [{
            price_data: {
                currency: 'usd',
                product_data:{
                    name: showData.movie.title
                },
                unit_amount: Math.floor(booking.amount) * 100
            },
            quantity: 1
         }]

         const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // Expires in 30 minutes
         })

         booking.paymentLink = session.url
         await booking.save()

         // Run Inngest Sheduler Function to check payment status after 10 minutes
         await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
         })

         res.json({success: true, url: session.url})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

export const getOccupiedSeats = async (req, res)=>{
    try {
        
        const {showId} = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({success: true, occupiedSeats})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
// export const checkPurchased = async (req, res) => {
//   const userId = req.auth().userId;
//   const { movieId } = req.params;

//   const bookings = await Booking.find({ user: userId }).populate("show");
//   const watched = bookings.some(b => b.show.movie == movieId);

//   res.json({ success: true, purchased: watched });
// };
export const checkPurchased = async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.auth.userId;

    // 1️⃣ Lấy tất cả suất chiếu thuộc movie
    const shows = await Show.find({ movie: movieId }).select("_id");
    const showIds = shows.map(s => s._id.toString());

    if (showIds.length === 0) {
      return res.json({ success: true, purchased: false });
    }

    // 2️⃣ Kiểm tra user đã mua suất nào chưa
    const hasBooked = await Booking.findOne({
      user: userId,
      show: { $in: showIds }
    });

    return res.json({
      success: true,
      purchased: !!hasBooked
    });

  } catch (error) {
    console.error(error);
    return res.json({ success: false, purchased: false });
  }
};