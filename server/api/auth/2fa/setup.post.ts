import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { updateUserTwoFactor } from '#server/services/user.service'

export default defineEventHandler(async (event) => {

    const session = await requireAuth(event)
    const secret = authenticator.generateSecret()
    const otpauthUrl = authenticator.keyuri(session.email, 'MonApp', secret)
    const qrCode = await QRCode.toDataURL(otpauthUrl)

    await updateUserTwoFactor(session.id, false, secret)

    return { qrCode, secret }
})