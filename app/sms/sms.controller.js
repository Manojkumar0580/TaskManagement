const keys = require('../utils/config/index');
const client = require('twilio')(keys.twilioSid, keys.twilioAuthToken);
const OtpModel = require('../models/user/otp.schema');

const sendSMS = async (countryCode, phone, message) => {
    try {
        const response = await client.messages.create({
            body: message,
            to: `${countryCode}${phone}`, // Text your number
            from: keys.twilioNumber, // From a valid Twilio number
        });
        if (message) return { message: response, success: (response.sid ? true : false) }
        else return { message: "Unable to send SMS.", success: false }
    } catch (e) {
        return { message: "Failed to send SMS.", success: false }
    }
}
const sms = {
    sendOTP: async (countryCode, phone) => {
        function generateOTP(limit) {
            var digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < limit; i++) {
                OTP += digits[Math.floor(Math.random() * digits.length)];
            }
            return OTP;
        }
        const OTP = generateOTP(6);

        // const smsResponse = await sendSMS(countryCode, phone, `Your verification code is: ${OTP}`)
        if (true) {
            async function updateOrCreateUser(countryCode, phone, updatedFields) {
                try {
                    let user = await OtpModel.findOne({ Phone: phone, CountryCode:countryCode });

                    if (user) {
                        user.set(updatedFields);
                        await user.save();
                        return user;
                    } else {
                        user = new OtpModel({
                            Phone: phone,
                            ...updatedFields,
                        });
                        await user.save();
                        return user;
                    }
                } catch (error) {
                    return error;
                }
            }

            const response = await updateOrCreateUser(countryCode, phone, { Phone: phone, Otp: OTP,CountryCode:countryCode });
            return {
                success: true, message: response._id
            }
        }
        else return {success:false}
    },
}
module.exports = sms;