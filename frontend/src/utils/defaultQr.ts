import type {ErrorCorrectionLevel,Options} from 'qr-code-styling'
//export {default as QRCodeStyling} from 'qr-code-styling'

const qrOptions: Options = {
  width:500,
  height:500,
  type:'svg',
  margin:5,
  image:"/icon/android-icon-192x192.png",
  qrOptions:{
    typeNumber:0,
    mode:'Byte',
    errorCorrectionLevel:'H' as ErrorCorrectionLevel
  },
  imageOptions:{
    hideBackgroundDots:true,
    imageSize:0.2,
    margin:5,
    crossOrigin:'anonymous'
  },
  dotsOptions:{
    color:'#2f6f4e',
    type:'rounded'
  },
  cornersSquareOptions:{
    color:'#9C1616',
    type:"extra-rounded"
  },
  cornersDotOptions:{
    color:'#000'
  }
}

export default qrOptions;