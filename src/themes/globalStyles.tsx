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
          //margin: 0,
          //padding: 0,
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
        'ul,ol':{
          paddingInlineStart:20
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
        'code:not(.hljs), blockquote, code.code:not(.hljs)':{
          background:theme.palette.action.hover,
          color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
          borderRadius:'.5rem',
          padding:'.15rem .5rem',
        },
        blockquote:{
          fontSize:16,
          width:'100%',
          margin:'10px 0 10px 0',
          padding: '1em 10px 1em 15px',
          borderLeft:'8px solid #78c0a8',
          position:'relative',
          overflowX:'auto'
        },
        'blockquote::before':{
          fontFamily:'Arial',
          color:'#78c0a8',
          fontSize:'4em',
          position:'absolute',
          left:10,
          top:-10
        },
        'blockquote::after':{
          content:"''"
        },
        'blockquote span':{
          display:'block',
          color:'#333',
          fontStyle:'normal',
          fontWeight:700,
          marginTop:'1em'
        },
        li:{
          listStylePosition:'inside'
        },
        'li:not(.MuiListItem-container):not(.MuiBreadcrumbs-li):not(.MuiBreadcrumbs-separator)':{
          marginBottom:10
        },
        'li:not(.MuiListItem-container):not(.MuiBreadcrumbs-li):not(.MuiBreadcrumbs-separator):last-child': {
          marginBottom:'unset'
        },
        'ul.MuiPagination-ul li': {
          marginBottom:'inherit'
        },
        a: {color:'inherit',textDecoration:'unset',WebkitTapHighlightColor:'transparent'},
        'a p':{
          '&:hover':{textDecoration:'underline'}
        },
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
        },
        '.underline-heading':{
          paddingBottom:'.1rem',
          borderBottom:`1px solid ${theme.palette.divider}`
        },
        '.grecaptcha-badge':{
          visibility:'hidden'
        },
        '.sans-scroll-disabled':{
          overflow:'hidden'
        }
      }}
    />
  );
}
