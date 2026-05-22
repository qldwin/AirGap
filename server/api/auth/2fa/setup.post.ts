import { createTOTPKeyURI } from '@oslojs/otp'
import { encodeBase32 } from '@oslojs/encoding'
import QRCode from 'qrcode'
import { updateUserTwoFactor } from '#server/services/user.service'

export default defineEventHandler(async (event) => {
    const session = await requireAuth(event)
    const secretBytes = crypto.getRandomValues(new Uint8Array(20))
    const secret = encodeBase32(secretBytes)
    const otpauthUrl = createTOTPKeyURI('AirGap', session.email, secretBytes, 30, 6)
    const qrCode = await QRCode.toDataURL(otpauthUrl)

    await updateUserTwoFactor(session.id, false, secret)

    return { qrCode, secret }
})