import ImageKit from 'imagekit'
import dotenv from 'dotenv'

dotenv.config()

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY
const urlEndpoint = process.env.IMAGEKIT_ENDPOINT_URL

if (!publicKey || !privateKey || !urlEndpoint) {
  console.warn(
    'Warning: ImageKit environment variables (IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_ENDPOINT_URL) are not fully configured.'
  )
}

const imagekit = new ImageKit({
  publicKey: publicKey || '',
  privateKey: privateKey || '',
  urlEndpoint: urlEndpoint || ''
})

export default imagekit
