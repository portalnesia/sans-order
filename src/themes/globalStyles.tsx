// material
import { useTheme } from '@mui/material/styles';
import { GlobalStyles as GlobalThemeStyles } from '@mui/material';

// ----------------------------------------------------------------------

export default function GlobalStyles() {
  const theme = useTheme();

  return (
    <GlobalThemeStyles
      styles={{
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box'
        },
        html: {
          width: '100%',
          height: '100%',
          WebkitOverflowScrolling: 'touch'
        },
        body: {
          width: '100%',
          height: '100%'
        },
        '#root': {
          width: '100%',
          height: '100%'
        },
        input: {
          '&[type=number]': {
            MozAppearance: 'textfield',
            '&::-webkit-outer-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            },
            '&::-webkit-inner-spin-button': {
              margin: 0,
              WebkitAppearance: 'none'
            }
          }
        },
        textarea: {
          '&::-webkit-input-placeholder': {
            color: theme.palette.text.disabled
          },
          '&::-moz-placeholder': {
            opacity: 1,
            color: theme.palette.text.disabled
          },
          '&:-ms-input-placeholder': {
            color: theme.palette.text.disabled
          },
          '&::placeholder': {
            color: theme.palette.text.disabled
          }
        },
        'pre code':{
          overflowX: 'auto',
          width:'100%',
          padding:'.6rem .8125rem',
          boxSizing:'border-box',
          whiteSpace: 'pre-wrap',
        },
        pre:{
          marginTop:16,
          marginBottom:16
        },
        a: {color:'inherit',textDecoration:'unset',WebkitTapHighlightColor:'transparent'},
        img: { display: 'block', maxWidth: '100%' },

        // Lazy Load Img
        '.blur-up': {
          WebkitFilter: 'blur(5px)',
          filter: 'blur(5px)',
          transition: 'filter 400ms, -webkit-filter 400ms'
        },
        '.blur-up.lazyloaded ': {
          WebkitFilter: 'blur(0)',
          filter: 'blur(0)'
        },
        '.flex-header':{
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between'
        },
        '.image-container': {
          borderRadius:'.525rem',
          objectFit:'cover',
          objectPosition:'center',
          opacity: 1,
          WebkitTransition: '.3s ease-in-out',
          transition: '.3s ease-in-out',
          '&:hover':{
            opacity:'0.6 !important',
          }
        },
        '#nprogress .bar':{
          background: `${theme.palette.primary.main} !important`,
          zIndex: '9999  !important',
          height: '4px !important',
        }
      }}
    />
  );
}
