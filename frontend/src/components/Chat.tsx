import {styled,IconButton,alpha, Drawer, AppBar, Paper, Theme} from '@mui/material'
import Avatar from './Avatar'
import SlideDown from 'react-slidedown'

const sidebarWidth=300;

function getBackground(theme: Theme) {
  return theme.palette.background.paper
}

export const ChatRoot = styled('div')(({theme}) => ({
  display:'flex',
  flexGrow:1,
  flexDirection:'column',
  background:theme.palette.background.default,
  height:`100%`,
  [theme.breakpoints.up('sm')]:{
    position:'relative',
  },
  [theme.breakpoints.down('sm')]: {
    top:0,
    left:'100vw',
    width:'100%',
    position:'absolute',
    overflow:'auto',
  },
  transition:'left .5s ease-in-out',
  '&.root-container':{
    [theme.breakpoints.down('sm')]: {
      left:'0',
      zIndex:'1100',
    },
  }
}))

export const ChatHeader = styled(AppBar)(({theme})=>({
  width:'100%',
  height:`${theme.spacing(8)}`,
  display:'flex',
  zIndex:'1000',
  justifyContent:'center',
  background:getBackground(theme),
  color:`${theme.palette.mode==='dark' ? '#fff' : '#000'}`
}))

export const ChatIconButton = styled(IconButton)(({theme}) => ({
  color:`${theme.palette.mode==='dark' ? '#fff' : '#000'}`,
  '&.margin-right': {
    marginRight:theme.spacing(1)
  }
}))

export const ChatAvatar = styled(Avatar)(({theme})=>({
  marginRight:`${theme.spacing(1.5)}`
}))

export const ChatSlidedown = styled(SlideDown)(({theme}) => ({
  position:'sticky',
  top:theme.spacing(8),
  left:0,
  zIndex:1000,
  '&.notification':{
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    padding:'5px 15px',
    background:theme.palette.secondary.main,
    width:'100%',
    zIndex:1000,
    color:'#fff',
    '& svg':{
      color:'#fff'
    }
  }
}))

export const ChatToBottom = styled('div')(({theme}) => ({
  position:'absolute',
  bottom:theme.spacing(12),
  right:theme.spacing(2),
  background:theme.palette.getContrastText(theme.palette.background.default),
  zIndex:1000,
  opacity:0.7,
  borderRadius:'50%',
  '&:hover':{
    opacity:1
  },
  '& svg':{
    color:theme.palette.background.default
  }
}))

export const ChatWrapper = styled('ul')(({theme}) => ({
  height:`calc(100% - ${theme.spacing(8)})`,
  padding:theme.spacing(3),
  overflow:'auto',
  marginTop:theme.spacing(8),
  '& li':{
    display:'block',
    position:'relative',
    marginBottom:theme.spacing(3),
    '&:last-child':{
      marginBottom:0,
    },
  },
  '& .info':{
    '& svg':{
      marginRight:'.25rem',
      fontSize:13,
    },
    [`& .read`]:{
      color:'#33b6f0',
    },
    '& time':{
      fontSize:12,
    },
    color:'#9e9e9e',
    display:'flex',
    alignItems:'center'
  },
  '@media (hover: hover) and (pointer: fine)':{
    '&::-webkit-scrollbar':{
      width:'.7em',
      borderRadius:4
    },
    '&::-webkit-scrollbar-thumb':{
      background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
      borderRadius:4
    },
  },
  '& li.date':{
    textAlign:'center',
    margin:'20px 0',
    color:'#9e9e9e',
  }
}))

export const ChatDivWrapper = styled('div')(({theme}) => ({
  height:`calc(100% - ${theme.spacing(8)})`,
  padding:theme.spacing(3),
  overflow:'auto',
  marginTop:theme.spacing(8),
  display:'flex',
  justifyContent:'center',
  alignItems:'center',
  '@media (hover: hover) and (pointer: fine)':{
    '&::-webkit-scrollbar':{
      width:'.7em',
      borderRadius:4
    },
    '&::-webkit-scrollbar-thumb':{
      background:theme.palette.mode==='dark' ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.2)',
      borderRadius:4
    },
  },
}))

export const ChatContainer = styled('li')<{chatAlign:'left'|'right'}>(({theme,chatAlign}) => ({
  '& .chatSpan': {
    '& a':{
      color:theme.palette.info.main
    }
  },
  '& .noselect':{
    WebkitTouchCallout: 'none',
    WebkitUserSelect:'none',
    KhtmlUserSelect:'none',
    MozUserSelect:'none',
    MsUserSelect:'none',
    userSelect:'none',
  },
  ...(chatAlign === 'left' ? {
    '& div.chat':{
      flex:1,
      '& .chatP':{
        position:'relative',
        marginBottom:10,
        marginRight:'15%',
        '& .chatSpan':{
          background:getBackground(theme),
          cursor:'pointer',
          minWidth:150,
          display:'inline-block',
          padding:10,
          borderRadius:10,
          wordBreak:'break-word'
        },
        '&:first-of-type':{
          '&::after':{
              top:0,
              left:'-11px',
              content:'""',
              position:'absolute',
              borderBottom:'17px solid transparent',
              borderRight:`11px solid ${getBackground(theme)}`
          },
          '& .chatSpan':{
            borderTopLeftRadius:0
          }
        },
      }
    }
  } : {
    flexDirection:'row-reverse',
    '& div.chat':{
      flex:1,
      '& .chatP':{
        position:'relative',
        marginBottom:10,
        marginLeft:'15%',
        '& .chatSpan':{
          background:theme.palette.mode === 'light' ? theme.palette.primary.lighter : theme.palette.primary.darker,
          cursor:'pointer',
          minWidth:150,
          display:'inline-block',
          padding:10,
          borderRadius:10,
          wordBreak:'break-word'
        },
        '&:first-of-type':{
          '&::after':{
              top:0,
              right:'-11px',
              content:'""',
              position:'absolute',
              borderBottom:'17px solid transparent',
              borderLeft:`11px solid ${theme.palette.mode === 'light' ? theme.palette.primary.lighter : theme.palette.primary.darker}`
          },
          '& .chatSpan':{
            borderTopRightRadius:0
          }
        },
      },
      display:'flex',
      justifyContent:'flex-end'
    }
  })
}))

export const ChatImage = styled('div')(({theme}) => ({
  background:alpha(theme.palette.primary.main,0.08),
  position:'absolute',
  zIndex:90,
  margin:`0 ${theme.spacing(2)}`,
  padding:`${theme.spacing(2)} 0`,
  textAlign:'center',
  width:`calc(100% - ${theme.spacing(4)})`,
  transition:'bottom 0.5s',
  '& img':{
    width:'auto',
    maxHeight:400,
    maxWidth:`calc(100% - ${theme.spacing(5)})`,
  },
  '& .imgBtn':{
    position:'absolute',
    borderRadius:'50%',
    background:alpha(theme.palette.primary.main,0.5),
    zIndex:1001,
    '& svg':{
      color:'#fff'
    },
    top:10,
    right:27
  }
}))

export const ChatFile = styled('div')(({theme}) => ({
  background:theme.palette.background.default,
  '& svg':{
    color:theme.palette.mode==='dark' ? 'rgba(255,255,255,0.08)' : theme.palette.primary.light,
    '&:hover':{
      color:theme.palette.mode==='dark' ? theme.palette.primary.light : theme.palette.primary.dark
    }
  },
  cursor:'pointer',
  position:'absolute',
  width:theme.spacing(3),
  height:theme.spacing(3),
  zIndex:100,
  margin:`0 ${theme.spacing(2)}`,
  transition:'bottom 0.1s'
}))

export const ChatInputContainer = styled(Paper)(({theme}) => ({
  display:'flex',
  maxHeight:'275px',
  alignItems:'center',
  background:getBackground(theme),
  bottom:'16px',
  margin:`0 ${theme.spacing(2)}`,
  position:'relative',
  padding:'10px',
  '& .disabled':{
    background:`${theme.palette.action.disabled}`
  },
  '& .input':{
    width:'100%',
    height:'100%',
    margin:'0',
    padding:`2px 20px 2px 2px`,
    boxSizing:'border-box',
    resize:'none',
    border:'none',
    boxShadow:'none',
    outline:'none',
    background:'transparent',
    color:theme.palette.text.primary,
    cursor:'auto',
    fontFamily:'"Inter var",Inter,-apple-system,BlinkMacSystemFont,"Helvetica Neue","Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,Droid Sans,Fira Sans,sans-serif',
    '@media (hover: hover) and (pointer: fine)':{
      '&::-webkit-scrollbar':{
          width:'.4em',
          borderRadius:4
      },
      '&::-webkit-scrollbar-thumb':{
          background:theme.palette.background.default,
          borderRadius:4
      },
    },
    '&::placeholder':{
      color:theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[100]
    },
  },
  '& .icon-label':{
    width:'100%',
    display:'flex',
    alignItems:'inherit',
    justifyContent:'inherit',
    '& svg':{
      color:theme.palette.primary.main
    }
  },
  '& .img-icon':{
    '& svg':{
      color:theme.palette.grey[500],
      '&:hover':{
        color:theme.palette.primary.main
      }
    },
  }
}))

export const ListRoot = styled(Drawer)(({theme}) => ({
  '& .MuiDrawer-paper':{
    position:'relative',
    [theme.breakpoints.up('md')]: {
      width:`${sidebarWidth}px`
    },
    [theme.breakpoints.down('lg')]: {
      width:'200px'
    },
    [theme.breakpoints.down('sm')]: {
      width:'100%'
    },
    background:`${theme.palette.background.default}`,
  },
  '& .MuiDrawer-docked':{
    height:'100%'
  }
}))

export const ListHeader = styled('div')(({theme}) => ({
  display:'flex',
  padding:theme.spacing(1),
  position:'relative',
  alignItems:'center',
  justifyContent:'center',
  height:theme.spacing(8),
  background: getBackground(theme),
  '& .headerContainer':{
    flex:1,
    height:'100%'
  },
  '& .inputContainer':{
    display:'block',
    position:'relative',
    background: theme.palette.mode==='dark' ? alpha(theme.palette.common.white, 0.15) : alpha(theme.palette.grey[500], 0.15),
    borderRadius:2,
    height:'100%',
    '&:hover':{
      background: theme.palette.mode==='dark' ? alpha(theme.palette.common.white, 0.25) : alpha(theme.palette.grey[500], 0.25),
    }
  },
  '& .search':{
    top:0,
    left:theme.spacing(1),
    width:'auto',
    height:'100%',
    display:'flex',
    position:'absolute',
    alignItems:'center',
    pointerEvents:'none',
    justifyContent:'center',
    color:theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[800]
  },
  '& .closeSearch':{
    top:'0',
    right:`${theme.spacing(1)}`,
    width:'auto',
    height:'100%',
    display:'flex',
    position:'absolute',
    alignItems:'center',
    justifyContent:'center',
    color:`${theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[800]}`,
    cursor:'pointer'
  },
  '& .input':{
    width:'100%',
    border:'0',
    margin:'0',
    display:'block',
    padding:`${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(1)} ${theme.spacing(5)}`,
    background:'none',
    whiteSpace:'normal',
    verticalAlign:'middle',
    height:'100%',
    '&::placeholder':{
      color:`${theme.palette.mode==='dark' ? theme.palette.grey[400] : theme.palette.grey[800]}`
    },
    color:`${theme.palette.mode==='dark' ? '#fff' : '#000'}`
  },
}))

export const ListContainer = styled('div')(({theme}) => ({
  height:`calc(100% - ${theme.spacing(14)})`,
  overflowY:'auto',
  '& .selected':{
    background:`${alpha(theme.palette.primary.light,0.25)}`,
    borderLeft:`8px solid ${theme.palette.primary.dark}`,
    paddingLeft:`${theme.spacing(2)}`
  },
  '&. listItem':{
    paddingLeft:`${theme.spacing(3)}`
  },
  '& .read':{
    width:15,
    border:`1px solid #fff`,
    height:15,
    display:'inline-block',
    borderRadius:'50%',
    background:'#CDDC39'
  }
}))

export const ParentRoot = styled('div')(({theme}) => ({
  height:'calc(100% - 92px)',
  paddingBottom:'0',
  zIndex:1,
  overflow:'hidden',
  position:'fixed',
  flexGrow:1,
  boxShadow:'0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)',
  borderRadius:2,
  [theme.breakpoints.up('sm')]: {
    display:'flex',
  },
  width:'100%',
  '&.image':{
    position:'fixed',
    zIndex:1500,
    background:'rgba(255,255,255,0.5)',
    justifyContent:'center',
    alignItems:'center',
    padding:'1rem',
    '& h4':{
      color:'#000'
    },
    opacity:0,
    display:'none',
    '&.show':{
      opacity:1,
      display:'flex'
    }
  }
}))