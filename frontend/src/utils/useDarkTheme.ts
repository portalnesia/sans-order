
import {useCallback} from 'react'
import cookies from 'js-cookie'
import {useSelector,useDispatch,State} from '@redux/index'
import {Dispatch} from 'redux'
import useMediaQuery from '@mui/material/useMediaQuery';

export default function useDarkTheme() {
    const theme = useSelector<State['theme']>(s=>s.theme);
    const dispatch = useDispatch();
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const isDark=prefersDarkMode && theme==='auto'||theme==='dark';

    const sendTheme=useCallback((val1:State['theme'],val2:State['redux_theme'])=>(dispatch: Dispatch)=>{
        dispatch({type:"CHANGE_THEME",payload:val1})
        dispatch({type:"REDUX_THEME",payload:val2})
    },[])

    const setTheme = useCallback((value: State['theme'],force?:boolean)=>{
      const winDark = window?.matchMedia && window?.matchMedia('(prefers-color-scheme: dark)').matches;
      const prefersDark = prefersDarkMode || winDark;
      const newVal:State['redux_theme'] = (prefersDark && value=='auto')||value=='dark' ? 'dark' : 'light';
      const kuki:State['theme'] = ['light','dark','auto'].indexOf(value) !== -1 ? value : 'auto';
      if(force!==true) cookies.set('sans_theme',kuki,{expires:(30*12)});
      const lightStyle = document.querySelector('link.higtlightjs-light');
      const darkStyle = document.querySelector('link.higtlightjs-dark');

      if(newVal === 'light') {
          darkStyle?.setAttribute('disabled','disabled');
          lightStyle?.removeAttribute('disabled');
      } else {
          lightStyle?.setAttribute('disabled','disabled');
          darkStyle?.removeAttribute('disabled');
      }
      // @ts-ignore
      dispatch(sendTheme(kuki,newVal));
  },[prefersDarkMode,dispatch,sendTheme])

    const checkTheme = useCallback(()=>{
      const theme = cookies.get('sans_theme') as State['redux_theme']|undefined;
      if(theme) return theme;
      const winDark = window?.matchMedia && window?.matchMedia('(prefers-color-scheme: dark)').matches;
      const prefersDark = prefersDarkMode || winDark;
      return( prefersDark ? 'dark' : 'light');
    },[prefersDarkMode])

    return {theme,isDark,setTheme,prefersDarkMode,checkTheme}
}