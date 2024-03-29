import React from 'react'
import { alpha,styled, SxProps,Theme } from '@mui/material/styles';
import {IconButton,Popover as Popov} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {useTranslation} from 'next-i18next';

const Popover = styled(Popov)(()=>({
  '.MuiPaper-root':{
      overflow:'hidden'
  }
}))

const Wrapper = styled('div')<{autoresize?:boolean}>(({theme,autoresize})=>({
  position: 'relative',
  borderRadius: 10,
  background: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.08 : 0.15),
  display: 'inline-block',
  '&:hover': {
      background: alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.15 : 0.18),
  },
  ...(autoresize ? {
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
  }:{})
}))

const SearchStyle = styled('div')(({theme})=>({
  width: theme.spacing(5),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}))

const DeleteStyle = styled('div')<{focused?:boolean}>(({theme,focused})=>({
  width: theme.spacing(5),
  height: '100%',
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  cursor:'pointer',
  display:'dlex'
}))

const InputStyle = styled('input')<{removed?:boolean,autoresize?:boolean}>(({theme,removed,autoresize})=>({
  font: 'inherit',
  padding: `${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(5)}`,
  border: 0,
  display: 'block',
  verticalAlign: 'middle',
  whiteSpace: 'normal',
  background: 'none',
  margin: 0, // Reset for Safari
  color: 'inherit',
  '&:focus-visible':{
      outline:'unset'
  },
  ...(autoresize ? {
      transition: theme.transitions.create('width'),
      width: 180,
      '&:focus': {
          width: 350,
      },
  } : {width: '100%','&:focus': {outline: 0}}),
  ...(removed ? {padding: `${theme.spacing(1)} ${theme.spacing(5)} ${theme.spacing(1)} ${theme.spacing(5)}`} : {})
}))

export interface SearchProps {
  onsubmit?: React.FormEventHandler<HTMLFormElement>
  onremove?: React.MouseEventHandler<HTMLButtonElement>
  onchange?: React.ChangeEventHandler<HTMLInputElement>
  remove?: boolean;
  value: string;
  autosize?: boolean;
  sx?: SxProps<Theme>;
  /**
   * Position if not autosize
   */
  position?:'left'|'right'
}

export default function Search({onsubmit,onremove,onchange,remove=false,value,autosize=false,sx}: SearchProps) {
  const {t} = useTranslation('common');
  const [anchor,setAnchor] = React.useState<({top:number,left: number})|null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDivClick=React.useCallback((e: React.MouseEvent<HTMLButtonElement>)=>{
    if(anchor === null) {
      setAnchor({top:e.clientY,left:15});
      setTimeout(()=>inputRef.current?.focus(),100);
    } else {
      setAnchor(null)
    }
  },[anchor]);

  const handleRemove=React.useCallback((e: React.MouseEvent<HTMLButtonElement>)=>{
      if(e?.stopPropagation) e.stopPropagation();
      if(onremove) onremove(e)
      setTimeout(()=>inputRef.current?.focus(),100);
  },[onremove])

  const handleSubmit=React.useCallback((e: React.FormEvent<HTMLFormElement>)=>{
    if(e?.preventDefault) e.preventDefault();
    if(onsubmit) {
      setAnchor(null)
      onsubmit(e);
    }
  },[onsubmit])

  return (
      <>
          {autosize ? (
              <form onSubmit={handleSubmit}>
                  <Wrapper autoresize>
                      {remove && value?.length > 0? (
                          <DeleteStyle focused={value?.length > 0 }>
                              <IconButton onClick={handleRemove} size="small">
                                  <ClearIcon />
                              </IconButton>
                          </DeleteStyle>
                      ) : (
                          <SearchStyle>
                              <SearchIcon />
                          </SearchStyle>
                      )}
                      <InputStyle ref={inputRef} sx={sx} autoresize removed={remove && value?.length > 0} placeholder={`${t("search")}...`} value={value} onChange={onchange} />
                  </Wrapper>
              </form>
          ) : (
              <div>
                  <IconButton onClick={handleDivClick}>
                      <SearchIcon />
                  </IconButton>

                  <Popover
                      open={anchor!==null}
                      anchorReference='anchorPosition'
                      anchorPosition={anchor !== null ? anchor : undefined}
                      onClose={handleDivClick}
                      anchorOrigin={{
                          vertical:'center',
                          horizontal:'center'
                      }}
                      transformOrigin={{
                          vertical:'center',
                          horizontal:'right'
                      }}
                  >
                      <form onSubmit={handleSubmit}>
                          <Wrapper sx={{width:`calc(100vw - 30px)`}}>
                              {remove && value?.length > 0? (
                                  <DeleteStyle focused={value?.length > 0 }>
                                      <IconButton onClick={handleRemove} size="small">
                                          <ClearIcon />
                                      </IconButton>
                                  </DeleteStyle>
                              ) : (
                                  <SearchStyle>
                                      <SearchIcon />
                                  </SearchStyle>
                              )}
                              <InputStyle ref={inputRef} sx={sx} removed={remove && value?.length > 0} placeholder={`${t("search")}...`} value={value} onChange={onchange} />
                          </Wrapper>
                      </form>
                  </Popover>
              </div>
          )}
          
      </>
  );
}