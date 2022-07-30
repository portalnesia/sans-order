import type { Strapi } from "@strapi/strapi"
import Payment from "../../../../utils/payment"

const paymentServices = (strapi: Strapi) => {
  const payment = new Payment(strapi);

  return payment
}

export default paymentServices;