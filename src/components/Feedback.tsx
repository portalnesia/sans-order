import React from 'react'
import html2canvas from 'html2canvas';
import {deviceDetect,isMobile} from 'react-device-detect'
import {withSnackbar,SnackbarMessage,SnackbarKey,OptionsObject} from 'notistack'
import Rating from '@mui/material/Rating'
import {ArrowBack,Close} from '@mui/icons-material'
import {IconButton} from '@mui/material'
import {connect} from 'react-redux'
import {version} from '@root/src/version'
import { State,IUser } from '@redux/index';
import { Without } from '@type/index';

const funcs = {
  support_canvas: () => {
    let elem = document.createElement('canvas');
    return !!(elem.getContext && elem.getContext('2d'));
  },
  support_video: () => {
    return !!document.createElement('video').canPlayType;
  },
  support_svg: () => {
    return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect;
  },
  support_audio: () => {
    return !!document.createElement('audio').canPlayType;
  },
  support_webWorker: () => {
    return !!window.Worker;
  },
  support_css3: () => {
    let div = document.createElement('div'),
        vendors = 'Ms O Moz Webkit'.split(' '),
        len = vendors.length;

    return (prop: any) => {
      if (prop in div.style) return true;

      prop = prop.replace(/^[a-z]/, (val: any) => {
        return val.toUpperCase();
      });

      while (len--) {
        if (vendors[len] + prop in div.style) {
          return true;
        }
      }
      return false;
    };
  },
  support_css3_3d: () => {
    let docElement = document.documentElement;
    let support = funcs.support_css3()('perspective');
    let body = document.body;
    if (support && 'webkitPerspective' in docElement.style) {
      let style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '@media (transform-3d),(-webkit-transform-3d){#css3_3d_test{left:9px;position:absolute;height:3px;}}';
      body.appendChild(style);
      let div = document.createElement('div');
      div.id = 'css3_3d_test';
      body.appendChild(div);
      support = div.offsetLeft === 9 && div.offsetHeight === 3;
      const el = document?.getElementById('css3_3d_test')
      if(el) document.getElementById('css3_3d_test')?.parentNode?.removeChild(el);
    }
    return support;
  },
  support_webSocket: () => {
      return 'WebSocket' in window || 'MozWebSocket' in window;
  },
  support_localStorage: () => {
      try {
          if ('localStorage' in window && window['localStorage'] !== null) {
              localStorage.setItem('test_str', 'test_str');
              localStorage.removeItem('test_str');
              return true;
          }
          return false;
      }
      catch (e) {
          return false;
      }
  },
  support_sessionStorage: () => {
      try {
          if ('localStorage' in window && window['sessionStorage'] !== null) {
              localStorage.setItem('test_str', 'test_str');
              localStorage.removeItem('test_str');
              return true;
          }
          return false;
      }
      catch (e) {
          return false;
      }
  },
  support_geolocation: () => {
      return 'geolocation' in navigator;
  },
  getPluginName: () => {
      let info = "";
      let plugins = navigator.plugins;
      if (plugins.length > 0) {
          for (let i = 0; i < navigator.plugins.length; i++) {
              info += navigator.plugins[i].name + ",";
          }
      }
      return info;
  },
  support_history: () => {
      return !!(window.history && history.pushState);
  },
};

export const defaultSysInfo={
  origin: '' as any,
  browserDetail: {} as any,
  userAgent: '' as any,
  appName: '' as any,
  appVersion: '' as any,
  cookieEnabled: false,
  mimeType: [] as any,
  platform: '' as any,
  screenWidth: '' as any,
  screenHeight: '' as any,
  colorDepth: '' as any,
  onLine: '' as any,
  support_localStorage: '' as any,
  support_sessionStorage: '' as any,
  support_history: '' as any,
  support_webSocket: '' as any,
  support_webWorker: '' as any,
  support_canvas: '' as any,
  support_video: '' as any,
  support_audio: '' as any,
  support_svg: '' as any,
  support_css3_3d: '' as any,
  support_geolocation: '' as any,
  plugins: '' as any,
  version:'' as any,
  Accounts: undefined as Pick<IUser,'name'|'username'|'email'>|null|undefined
}

type ISysInfo = typeof defaultSysInfo;
type PSysInfo = Without<ISysInfo,'version'|'Accounts'>

export const getSysInfo=(string?: boolean)=>{
  const browser: any= deviceDetect(undefined);
  if(typeof browser.ua !== 'undefined') delete browser.ua

  let sysInfo: PSysInfo={
    browserDetail:(string===true) ? JSON.stringify(browser) : browser,
    appName: navigator.appName,
    appVersion: navigator.appVersion,
    cookieEnabled: navigator.cookieEnabled,
    mimeType: navigator.mimeTypes,
    platform: navigator.platform,
    screenWidth: screen.width,
    screenHeight: screen.height,
    colorDepth: screen.colorDepth,
    onLine: navigator.onLine,
    support_localStorage: funcs.support_localStorage(),
    support_sessionStorage: funcs.support_sessionStorage(),
    support_history: funcs.support_history(),
    support_webSocket: funcs.support_webSocket(),
    support_webWorker: funcs.support_webWorker(),
    support_canvas: funcs.support_canvas(),
    support_video: funcs.support_video(),
    support_audio: funcs.support_audio(),
    support_svg: funcs.support_svg(),
    support_css3_3d: funcs.support_css3_3d(),
    support_geolocation: funcs.support_geolocation(),
    plugins: funcs.getPluginName(),
    origin:window.location.href,
    userAgent:navigator.userAgent
  };
  return sysInfo;
}

const hightLightEl = ['button','td','th','code','pre','blockquote','li', 'a', 'span','em','i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'strong', 'small', 'sub', 'sup', 'b', 'time', 'img', 'video', 'input', 'label', 'select', 'textarea', 'article', 'summary', 'section'];

const LegalComponent=({onclick}:{onclick?:React.MouseEventHandler<HTMLSpanElement>})=>{
  return (
      <p style={{fontSize:12}}>
          Some <span onClick={onclick} style={{fontSize:12,color:'#3986FF',cursor:'pointer'}}>system information</span> may be sent to Portalnesia. We will use the information that give us to help address technical issues and to improve our services.
      </p>
  )
}

export type IData = {sysInfo: ISysInfo,text?: string,screenshot?:string,rating?:number|null}

export interface FeedbackProps {
  disabled?:boolean,
  loading?:boolean,
  proxy?:string,
  loadingTip?:string
  required?:boolean,
  rating?: string,
  onSend?(data: IData): void,
  onCancel?(): void,
  title?: string
  placeholder?:string,
  checkboxLabel?: string,
  cancelLabel?: string
  confirmLabel?: string,
  hightlightTip?: string,
  hideTip?: string,
  editDoneLabel?: string,
  license?: string,
  editTip?: string,
  requiredTip?: string
}

interface FeedbackClassProps {  
  enqueueSnackbar(message: SnackbarMessage, options?: OptionsObject | undefined): SnackbarKey
  closeSnackbar(key?: SnackbarKey | undefined): void,
  theme?: any
  user: Pick<IUser,'name'|'username'|'email'>|null,
  dispatch: any
}

interface FeedbackState {
  docWidth: number,
  docHeight: number,
  winHeight: number,
  shotOpen: boolean,
  loading: boolean,
  screenshotEdit: boolean,
  editMode: boolean,
  toolBarType: string,
  hightlightItem: any[],
  blackItem: any[],
  text: string,
  textError: string,
  feedbackVal: number|null,
  showInformation: boolean;
}

type FeedbackAllProps = FeedbackProps&FeedbackClassProps

class FeedbackClass extends React.PureComponent<FeedbackAllProps,FeedbackState> {
  sysInfo: ISysInfo
  inputSysInfo: PSysInfo
  move: boolean
  eX: number
  eY: number
  ctx: any
  dragRect: boolean
  startX: number
  startY: number
  shadowCanvas?: any
  canvas?: any
  hightlight?: any
  black?: any
  hasHelper=false;
  sctx?: any
  toolBar?: any
  screenshotPrev?: any
  textarea?: any
  canvasMD=false
  timer?: NodeJS.Timeout

  constructor(props: FeedbackAllProps) {
    super(props);
    this.state= {
      docWidth: document.body.clientWidth,
      docHeight: document.body.clientHeight,
      winHeight: window.innerHeight,
      shotOpen: true,
      loading: false,
      screenshotEdit: false,
      editMode: false,
      toolBarType: 'highlight',
      hightlightItem: [],
      blackItem: [],
      text: '',
      textError: '',
      feedbackVal: null,
      showInformation: false
    }
    this.sysInfo = defaultSysInfo;
    this.inputSysInfo = defaultSysInfo;
    this.move = false;
    this.eX = 0;
    this.eY = 0;
    this.ctx = null;
    this.dragRect = false;
    this.startX = 0;
    this.startY = 0;
  }
  static defaultProps: Partial<FeedbackAllProps>={
    title:'Send Feedback',
    placeholder:'Please explain your problem or share your thoughts',
    checkboxLabel:'Include screenshots',
    loadingTip:'Loading screenshots...',
    editTip:'Highlight or hide information',
    cancelLabel:'Cancel',
    confirmLabel:'Send',
    hightlightTip:'Highlight the problem',
    hideTip:'Hide sensitive information',
    requiredTip:'Description must be added',
    editDoneLabel:'Done',
    disabled:false,
    required : false,
    proxy:`${process.env.NEXT_PUBLIC_URL}/canvas-proxy`
  }

  getSysInfo() {
    const sysInfo = getSysInfo();
    const accInfo=(this.props.user && this.props.user!==null ? {Accounts:this.props.user} : {Accounts:undefined})

    this.sysInfo = {
      ...accInfo,
      version:`v${version}`,
      ...sysInfo
    }
    this.inputSysInfo = sysInfo;
  }
  switchCanvasVisible(visible?: boolean) {
    if (visible) {
      this.shadowCanvas?.current.removeAttribute('data-html2canvas-ignore');
    } else {
      this.shadowCanvas?.current.setAttribute('data-html2canvas-ignore', 'true');
    }
  }

  inElement(e:any) {
    let x = e.clientX,
        y = e.clientY;
    let el = document.elementsFromPoint(x, y)[3];
    this.canvas.current.style.cursor = 'crosshair';
    if (el && hightLightEl.indexOf(el.nodeName.toLocaleLowerCase()) > -1 || el && el?.classList.contains("MuiInputBase-root") || el && el?.classList.contains("MuiSelect-root") || el && el?.classList.contains("pn-sort")) {
        let rect = el.getBoundingClientRect();
        let rectInfo = {
            sx: rect.left + (document.documentElement.scrollLeft + document.body.scrollLeft),
            sy: rect.top + (document.documentElement.scrollTop + document.body.scrollTop),
            width: rect.width,
            height: rect.height
        };
        return rectInfo;
    } else {
        return false;
    }
  }

  elementHelper(e: any) {
    let rectInfo = this.inElement(e);
    if (rectInfo) {
      this.canvas.current.style.cursor = 'pointer';
      //this.drawElementHelper(rectInfo);
      this.hasHelper = true;
    } else {
      if (this.hasHelper) {
        this.hasHelper = false;
        //this.initCanvas();
        //this.drawHightlightBorder();
        //this.drawHightlightArea()
      }
    }
  }

  elementHelperClick(e: any) {
    if (this.dragRect) return;
    let nodeName = e.target.nodeName;
    if (nodeName != 'CANVAS') return;
    let rectInfo = this.inElement(e);
    if (rectInfo) {
      let toolBarType = this.state.toolBarType;
      if (toolBarType == 'hightlight') {
        let hightlightItem = this.state.hightlightItem;
        hightlightItem.push(rectInfo);
        this.setState({
          hightlightItem: hightlightItem,
        })
      } else if (toolBarType == 'black') {
        let blackItem = this.state.blackItem;
        blackItem.push(rectInfo);
        this.setState({
            blackItem: blackItem,
        })
      }
    }
  }

  drawElementHelper(info: any) {
    //this.initCanvas();
    let toolBarType = this.state.toolBarType;
    if (toolBarType == 'hightlight') {
      this.ctx.lineWidth = '5';
      this.ctx.strokeStyle = '#FEEA4E';
      this.ctx.rect(info.sx, info.sy, info.width, info.height);
      this.ctx.stroke();
      //this.drawHightlightBorder();
      //this.drawHightlightArea();
      this.ctx.clearRect(info.sx, info.sy, info.width, info.height);
      //this.sctx.clearRect(info.sx, info.sy, info.width, info.height);
    } else if (toolBarType == 'black') {
      //this.drawHightlightBorder();
      //this.drawHightlightArea();
      this.ctx.fillStyle = 'rgba(0,0,0,.4)';
      this.ctx.fillRect(info.sx, info.sy, info.width, info.height);
    }
  }

  documentMouseMove(e: any) {
    if (this.canvasMD) {
        if (!this.dragRect) {
            this.dragRect = true;
        }
        let toolBarType = this.state.toolBarType;
        let clientX = e.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft),
            clientY = e.clientY + (document.documentElement.scrollTop + document.body.scrollTop),
            width = this.startX - clientX,
            height = this.startY - clientY;
        //this.initCanvas();
        //this.drawHightlightBorder();
        if (toolBarType == 'hightlight') {
            this.ctx.lineWidth = '5';
            this.ctx.strokeStyle = '#FEEA4E';
            this.ctx.rect(clientX, clientY, width, height);
            this.ctx.stroke();
            //this.drawHightlightArea();
            this.ctx.clearRect(clientX, clientY, width, height);
            this.sctx.clearRect(clientX, clientY, width, height);
        } else if (toolBarType == 'black') {
            //this.drawHightlightArea();
            this.ctx.fillStyle = 'rgba(0,0,0,.4)';
            this.ctx.fillRect(clientX, clientY, width, height);
        }
    } else {
        this.elementHelper(e);
    }
  }

  windowResize() {
    //this.calcHeight();
  }

  addEventListener() {
      document.addEventListener('mousemove', this.documentMouseMove, false);
      document.addEventListener('click', this.elementHelperClick, false);
      window.addEventListener('resize', this.windowResize, false);
  }
  removeEventListener() {
      document.removeEventListener('mousemove', this.documentMouseMove, false);
      document.removeEventListener('click', this.elementHelperClick, false);
      window.removeEventListener('resize', this.windowResize, false);
  }
  componentDidMount() {
      this.getSysInfo();
      //this.calcHeight();
      this.addEventListener();
      if (this.state.shotOpen) {
          //this.shotScreen()
      }
  }

  calcHeight() {
    let docWidth = document.body.clientWidth,
        docHeight = document.body.clientHeight;
    let windowHeight = window.innerHeight;
    if(docHeight < windowHeight) {
        docHeight = windowHeight;
    }
    this.setState({
        docWidth: docWidth,
        docHeight: docHeight,
        winHeight: windowHeight,
    });
    setTimeout(() => {
        this.initCanvas(true);
    });
  }

  componentWillUnmount() {
    if(this.timer) {
      clearTimeout(this.timer);
    }
    this.removeEventListener();
  }

  initCanvas(init?: boolean) {
    let canvas = this.canvas.current;
    let shadowCanvas = this.shadowCanvas.current;
    let docWidth = this.state.docWidth,
        docHeight = this.state.docHeight;
    if (!this.ctx) {
        this.ctx = canvas.getContext('2d');
    }
    if(!this.sctx) {
        this.sctx = shadowCanvas.getContext('2d');
    }
    if(init) {
        canvas.style.width = docWidth;
        canvas.style.height = docHeight;
        shadowCanvas.style.width = docWidth;
        shadowCanvas.style.height = docHeight;
    }
    canvas.width = docWidth;
    canvas.height = docHeight;
    shadowCanvas.width = docWidth;
    shadowCanvas.height = docHeight;
    this.sctx.fillStyle = 'rgba(0,0,0,0.38)';
    this.sctx.fillRect(0, 0, docWidth, docHeight);
  }

  drawHightlightBorder() {
    let hightlightItem = this.state.hightlightItem;
    hightlightItem.map((data, k) => {
      this.ctx.lineWidth = '5';
      this.ctx.strokeStyle = '#FEEA4E';
      this.ctx.rect(data.sx, data.sy, data.width, data.height);
      this.ctx.stroke();
    });
  }

  drawHightlightArea() {
      let hightlightItem = this.state.hightlightItem;
      hightlightItem.map((data, k) => {
        this.sctx.clearRect(data.sx, data.sy, data.width, data.height);
        this.ctx.clearRect(data.sx, data.sy, data.width, data.height);
      });
  }
  loadingState(state: boolean) {
      this.setState({
        loading: state,
      })
  }

  checkboxHandle() {
    if(this.props.disabled) return;
    this.setState({
      shotOpen: !this.state.shotOpen,
    });
    if (!this.state.shotOpen) {
      this.shotScreen();
    }
  }

  toEditMode() {
    if(this.props.disabled) return;
    this.setState({
      editMode: true,
    });
    setTimeout(() => {
      let toolBar = this.toolBar.current,
      windowWidth = window.innerWidth,
      windowHeight = window.innerHeight;
      toolBar.style.left = `${windowWidth * 0.5}px`;
      toolBar.style.top = `${windowHeight * 0.6}px`;
    });
  }

  editCancel() {
    this.setState({
      editMode: false,
    });
    setTimeout(() => {
      this.shotScreen();
    })
  }
  handleMoveMouseDown(e: any) {
    this.move = true;
    this.eX = e.clientX + window.scrollX;
    this.eY = e.clientY + window.scrollY;
  }

  handleMoveMouseUp(e: any) {
    this.move = false;
    this.canvasMD = false;
    if (this.dragRect) {
      let clientX = e.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft),
      clientY = e.clientY + (document.documentElement.scrollTop || document.body.scrollTop),
      width = this.startX - clientX,
      height = this.startY - clientY;
      if (Math.abs(width) < 6 || Math.abs(height) < 6) {
        return;
      }
      let toolBarType = this.state.toolBarType,
        hightlightItem = this.state.hightlightItem,
        blackItem = this.state.blackItem,
        obj = {
          sx: clientX,
          sy: clientY,
          width: width,
          height: height
        };
      if (width < 0) {
        obj.sx = obj.sx + width;
        obj.width = Math.abs(width);
      }
      if (height < 0) {
        obj.sy = obj.sy + height;
        obj.height = Math.abs(height);
      }
      if (toolBarType == 'hightlight') {
        hightlightItem.push(obj);
        this.setState({
          hightlightItem: hightlightItem,
        });
      } else if (toolBarType == 'black') {
        blackItem.push(obj);
        this.setState({
          blackItem: blackItem,
        })
      }
      setTimeout(() => {
        this.dragRect = false;
        this.drawHightlightBorder();
        this.drawHightlightArea();
      });
    }
  }

  handleMouseMove(e: any) {
    if (!this.move)return;
    let toolBar = this.toolBar.current;
    let eX = this.eX;
    let eY = this.eY;
    let newEX = e.clientX + window.scrollX;
    let newEY = e.clientY + window.scrollY;
    let oX = newEX - eX;
    let oY = newEY - eY;
    let curL = parseFloat(toolBar.style.left);
    let curT = parseFloat(toolBar.style.top);
    toolBar.style.left = `${curL + oX}px`;
    toolBar.style.top = `${curT + oY}px`;
    this.eX = newEX;
    this.eY = newEY;
  }

  handleVideo(parent: any, resolve: any, reject: any) {
      const $ =require('jquery')
      let videoItem = parent.getElementsByTagName('video');
      if(videoItem == 0) {
        resolve();
        return;
      }
      for(let i = 0; i < videoItem.length; i ++) {
        let video = videoItem[0];
        if(!video.style.backgroundImage) {
          let w = $(video).width();
          let h = $(video).height();
          $(video).after('<canvas width="'+ w +'" height="'+ h +'"></canvas>');
          let canvas = $(video).next('canvas').css({display: 'none'});
          let ctx = canvas.get(0).getContext('2d');
          ctx.drawImage(video, 0, 0, w, h);
          try {
            video.style.backgroundImage = "url("+ canvas.get(0).toDataURL('image/png') +")";
          }catch (e) {
            console.log(e)
          }finally {
            canvas.remove();
          }
        }
      }
      resolve();
  }

  shotScreen() {
    if(this.props.disabled) return;
    if (this.state.loading)return;
    this.loadingState(true);
    let hightlightItem = this.state.hightlightItem;
    this.switchCanvasVisible(hightlightItem.length > 0);
    let videoPromise = new Promise((resolve, reject) => {
        this.handleVideo(document.body, resolve, reject);
    });
    Promise.all([videoPromise]).then(() => {
      html2canvas(document.body, {
        allowTaint:true,
        proxy: this.props.proxy || '',
        width: window.innerWidth,
        height: window.innerHeight,
        x: document.documentElement.scrollLeft || document.body.scrollLeft,
        y: document.documentElement.scrollTop || document.body.scrollTop,
        onclone:(doc)=>{
          const svgEl=doc?.body?.querySelectorAll('svg')
          if(svgEl){
            svgEl.forEach((item)=>{
              item.setAttribute("width",`${item.getBoundingClientRect()?.width}`)
              item.setAttribute("height",`${item.getBoundingClientRect()?.height}`)
              item.style.width='null';
              item.style.height='null';
            })
          }
          let menu=doc?.getElementById('sidebar-menu-content')
          if(menu) {
            menu.style.zIndex='5';
            const sidebar=doc?.getElementById('sidebar-menu')
            const parent=sidebar?.parentNode;
            parent?.insertBefore(menu,sidebar)
          }
          return doc;
        }
      }).then((canvas) => {
        let src = canvas.toDataURL('image/png');
        this.screenshotPrev.current.src = src;
        this.screenshotPrev.current.onload = () => {
          this.setState({
            screenshotEdit: true,
          })
        };
        this.loadingState(false);
      }).catch((e) => {
        this.setState({
          screenshotEdit: false,
        });
        this.loadingState(false);
        console.log(e)
      });
    });
  }

  clearHightlight(k: number, e: any) {
    let hightlightItem = this.state.hightlightItem;
    hightlightItem.splice(k, 1);
    this.setState({
      hightlightItem: hightlightItem,
    });
    setTimeout(() => {
      this.initCanvas();
      this.drawHightlightBorder();
      this.drawHightlightArea();
    });
  }

  clearBlack(k: number, e: any) {
    let blackItem = this.state.blackItem;
    blackItem.splice(k, 1);
    this.setState({
      blackItem: blackItem,
    });
  }

  canvasMouseDown(e: any) {
    this.canvasMD = true;
    this.startX = e.clientX + (document.documentElement.scrollLeft + document.body.scrollLeft);
    this.startY = e.clientY + (document.documentElement.scrollTop + document.body.scrollTop);
  }

  send() {
    if(this.props.disabled) return;
    if(this.state.loading && this.state.shotOpen) {
        this.props.enqueueSnackbar(this.props.loadingTip,{
            variant:'error',
            action:(key)=>(
                <IconButton
                    className={'snackbarIcon'}
                    onClick={()=>this.props.closeSnackbar(key)}
                    size="large">
                    <Close />
                </IconButton>
            )
        });
        return;
    }
    const text = this.state.text;
    if(this.props.required && text.length === 0) {
        this.setState({
          textError: this.props.requiredTip||FeedbackClass.defaultProps.requiredTip||'',
        });
        this.textarea.current.focus();
        return;
    }
    if(this.props.rating && this.state.feedbackVal===null) {
        this.props.enqueueSnackbar("Error: You have not provided your feedback",{
          variant:'error',
          action:(key)=>(
            <IconButton
              className={'snackbarIcon'}
              onClick={()=>this.props.closeSnackbar(key)}
              size="large">
              <Close />
            </IconButton>
          )
        });
        return;
    }
    this.getSysInfo();
    if (typeof this.props.onSend === 'function') {
      let data: IData = {
        sysInfo: {...this.inputSysInfo,...this.sysInfo},
        text: text,
      };
      if(this.state.shotOpen) {
        data.screenshot = this.screenshotPrev.current.src || '';
      }
      if(this.props.rating) {
        data.rating = this.state.feedbackVal
      }
      this.props.onSend(data);
    }
  }

  cancel() {
    if(this.props.disabled) return;
    if (typeof this.props.onCancel === 'function') this.props.onCancel();
  }

  showInformation(){
    this.setState({
      showInformation:!this.state.showInformation
    })
  }

  render() {
    const state = this.state,
    props = this.props;
    return(
      <div id="googleFeedback" style={{height: `${state.docHeight}px`}} onMouseMove={this.handleMouseMove.bind(this)} onMouseUp={this.handleMoveMouseUp.bind(this)}>
        {isMobile ? (
          <div className="feedback-window">
            {!state.editMode ? <div className="dialog-mask"></div> : null }
            {!state.editMode ? (
              <div id="feedbackDialog" className="dialog" data-html2canvas-ignore="true" style={{left: '50%', top: '50%',maxHeight:`${state.winHeight-40}px`,marginTop:`-${(state.winHeight-40)/2}px`}}>
                <div {...(state.showInformation ? {style:{display:'flex'}} : {})}>
                  {state.showInformation && (
                    <span className={`close btn${props.disabled ? ' disabled':''}`} style={{cursor:'pointer',background: props.theme || '#3986FF',width:56,height:56,alignItems:'center'}} onClick={this.showInformation.bind(this)}>
                        <ArrowBack className='svgIcon' />
                    </span>
                  )}
                  <div className="title" style={{background: props.theme || '#3986FF',width:'100%'}}>{state.showInformation ? "Additional info" : props.title}</div>
                </div>
                <div className="feedback-area">
                  {state.showInformation ? 
                    <div style={{background:'#fff',overflowY:'auto',padding:10,position:'absolute',zIndex:5,top:0,left:0,width:'100%',height:'100%',wordBreak:'break-word',msWordBreak:'break-word'}}>
                        {Object.keys(this.sysInfo).map((dt,i)=>{
                            if(typeof this.sysInfo?.[dt as keyof ISysInfo]==='object' && dt!== 'mimeType') {
                                return(
                                  <div key={i} style={{marginBottom:'1em'}}>
                                    <span style={{color:'#000000',textDecoration:'underline',marginBottom:'1em'}}><strong>{dt}: </strong></span><br />
                                    {Object.keys(this.sysInfo[dt as keyof ISysInfo]).map((dd,ii)=>(
                                      <p style={{marginBottom:'.5em',marginLeft:10}} key={`${i}-${ii}`}>
                                      <span style={{color:'#000000'}} key={`${i}-${ii}-0`}><strong>{dd}: </strong></span><br />
                                      <span style={{color:'#000000',marginLeft:10}} key={`${i}-${ii}-1`}>{this.sysInfo?.[dt as keyof ISysInfo]?.[dd].toString()}</span>
                                      </p>
                                    ))}
                                  </div>
                                )
                            } else if(dt!== 'mimeType'){
                              return(
                                <p key={i} style={{marginBottom:'1em'}}>
                                  <span style={{color:'#000000'}} key={`${i}-0`}><strong>{dt}: </strong></span><br />
                                  <span style={{color:'#000000',marginLeft:10}} key={`${i}-1`}>{this.sysInfo?.[dt as keyof ISysInfo].toString()}</span>
                                </p>
                              )
                            }
                        })}
                    </div>
                  : null}

                  <div style={{overflowY:'auto',maxHeight:`${state.winHeight-40-112}px`}}>
                    {this.props.rating && (
                      <div key={0} style={{display:'flex',alignItems: 'center',justifyContent:'center',margin:'20px 0'}}>
                        <Rating
                          classes={{sizeLarge:'fbLabel',iconEmpty:'iconEmpty'}}
                          name="hover-feedback"
                          value={this.state.feedbackVal}
                          onChange={(event, newValue)=>this.setState({feedbackVal:newValue})}
                          size="large"
                          disabled={props.disabled}
                        />
                      </div>
                    )}
                    <textarea placeholder={props.placeholder} ref={this.textarea} defaultValue={state.text} disabled={props.disabled}
                    onChange={(e) => {
                      this.setState({
                        text: e.target.value,
                        textError: '',
                      })
                    }}></textarea>
                    { state.textError ? <div className="required-tip">{state.textError}</div> : null }
                    <div className="shot-switch clearfix">
                      <div className={`checkbox${props.disabled ? ' disabled':''}`} onClick={this.checkboxHandle.bind(this)}>
                        <svg className={`checkbox-icon ${state.shotOpen ? '' : 'active'}`}
                          focusable="false"
                          aria-label="" fill="#757575" viewBox="0 0 24 24" height="24"
                          width="24">
                          <path
                              d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                        </svg>
                        <svg className={`checkbox-icon ${state.shotOpen ? 'active' : ''}`}
                          focusable="false"
                          aria-label="" fill={props.theme || '#3986FF'} viewBox="0 0 24 24"
                          height="24"
                          width="24">
                          <path
                              d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                        </svg>
                      </div>
                      <label>{`${props.checkboxLabel} (beta)`}</label>
                    </div>
                    {state.shotOpen ? (
                      <div className="screenshot-area">
                        {state.loading && (
                          <div className="loading">
                            <div className="loading-icon">
                              <svg viewBox="0 0 40 40"
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    position: 'relative'
                                  }}>
                                  <circle cx="20" cy="20" r="18.25" fill="none"
                                    strokeWidth="3.5"
                                    strokeMiterlimit="20"
                                    style={{
                                      stroke: props.theme || 'rgb(57, 134, 255)',
                                      strokeLinecap: 'round'
                                  }}></circle>
                              </svg>
                            </div>
                            <span className="loading-text">{this.props.loadingTip}</span> 
                          </div>
                        )}
                        <div className="screenshot">
                          {(state.screenshotEdit && !state.loading && !props.disabled) && (
                            <div className="to-edit" onClick={this.toEditMode.bind(this)}>
                              <div className="edit-icon">
                                  <svg focusable="false" aria-label="" fill="#757575"
                                      viewBox="0 0 24 24" height="48" width="48">
                                      <path
                                          d="M21 17h-2.58l2.51 2.56c-.18.69-.73 1.26-1.41 1.44L17 18.5V21h-2v-6h6v2zM19 7h2v2h-2V7zm2-2h-2V3.08c1.1 0 2 .92 2 1.92zm-6-2h2v2h-2V3zm4 8h2v2h-2v-2zM9 21H7v-2h2v2zM5 9H3V7h2v2zm0-5.92V5H3c0-1 1-1.92 2-1.92zM5 17H3v-2h2v2zM9 5H7V3h2v2zm4 0h-2V3h2v2zm0 16h-2v-2h2v2zm-8-8H3v-2h2v2zm0 8.08C3.9 21.08 3 20 3 19h2v2.08z"></path>
                                  </svg>
                              </div>
                              <span className="edit-label">{props.editTip}</span>
                            </div>
                          )}
                          <img id="screenshotPrev" ref={this.screenshotPrev} src=""/>
                        </div>
                      </div>
                    ) : null}
                    <div className="legal">{this.props.license || <LegalComponent onclick={this.showInformation.bind(this)} />}</div>
                  </div>
                  <div className="actions">
                    <div className={`flatbutton cancel${props.disabled ? ' disabled':''}`} style={{color: '#757575'}} onClick={this.cancel.bind(this)}>{props.cancelLabel}</div>
                    <div className={`flatbutton confirm${props.disabled ? ' disabled':''}`}
                      style={{color: this.props.theme || '#3986FF',position:'relative'}}
                      onClick={this.send.bind(this)}
                    >
                      {props.disabled && (
                        <div className="loading-icon">
                          <svg viewBox="0 0 40 40" style={{width: '40px', height: '40px', position: 'relative'}}>
                            <circle cx="20" cy="20" r="18.25" fill="none" strokeWidth="3.5"
                              strokeMiterlimit="20"
                              style={{stroke: 'rgb(57, 134, 255)', strokeLinecap: 'round'}}></circle>
                          </svg>
                        </div>
                      )}
                      {props.confirmLabel}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div ref={this.toolBar} className="tool-bar clearfix">
                <div className="move" onMouseDown={this.handleMoveMouseDown.bind(this)}>
                  <svg focusable="false" aria-label="Drag" fill="#BDBDBD" height="56" width="16" viewBox="-2 2 12 12">
                    <circle cx="1.5" cy="1.5" r="1.5"></circle>
                    <circle cx="1.5" cy="7.5" r="1.5"></circle>
                    <circle cx="1.5" cy="13.5" r="1.5"></circle>
                    <circle cx="6.5" cy="1.5" r="1.5"></circle>
                    <circle cx="6.5" cy="7.5" r="1.5"></circle>
                    <circle cx="6.5" cy="13.5" r="1.5"></circle>
                  </svg>
                </div>
                <div
                  className={`tool ${(this.state.toolBarType == 'hightlight') ? 'tool-active' : ''} hight-light`}
                  data-label={props.hightlightTip}
                  onClick={() => {
                    this.setState({
                      toolBarType: 'hightlight',
                    })
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      position: 'relative',
                      height: '36px',
                      width: '36px'
                    }}>
                    <svg
                      focusable="false" aria-label="" viewBox="0 0 24 24" height="36" width="36"
                      fill="#FFEB3B"><path d="M3 3h18v18H3z"></path></svg>
                    <svg focusable="false" aria-label=""
                      fill="#757575"
                      viewBox="0 0 24 24" height="36"
                      width="36" style={{
                      left: '0px',
                      position: 'absolute',
                      top: '0px'
                    }}>
                      {
                        this.state.toolBarType == 'hightlight' ?
                        <path
                          d="M21 17h-2.58l2.51 2.56c-.18.69-.73 1.26-1.41 1.44L17 18.5V21h-2v-6h6v2zM19 7h2v2h-2V7zm2-2h-2V3.08c1.1 0 2 .92 2 1.92zm-6-2h2v2h-2V3zm4 8h2v2h-2v-2zM9 21H7v-2h2v2zM5 9H3V7h2v2zm0-5.92V5H3c0-1 1-1.92 2-1.92zM5 17H3v-2h2v2zM9 5H7V3h2v2zm4 0h-2V3h2v2zm0 16h-2v-2h2v2zm-8-8H3v-2h2v2zm0 8.08C3.9 21.08 3 20 3 19h2v2.08z"></path> :
                        <path
                          d="M3 3h18v18H3z" fill="#FEEA4E"></path>
                      }
                    </svg>
                  </span>
                </div>
                <div className={`tool ${(this.state.toolBarType == 'black') ? 'tool-active' : ''} hide`}
                  data-label={props.hideTip}
                  onClick={() => {
                  this.setState({
                      toolBarType: 'black',
                  })
                }}>
                  <span
                  style={{
                      display: 'inline-block',
                      position: 'relative',
                      height: '36px',
                      width: '36px'
                  }}>
                    {this.state.toolBarType == 'black' ? (
                      <React.Fragment>
                        <svg focusable="false" aria-label="" viewBox="0 0 24 24" height="36" width="36" fill="#000">
                          <path d="M3 3h18v18H3z"></path>
                        </svg>
                        <svg focusable="false" aria-label="" fill="#757575" viewBox="0 0 24 24" height="36" width="36" style={{
                            left: '0px',
                            position: 'absolute',
                            top: '0px'
                        }}>
                          <path
                            d="M21 17h-2.58l2.51 2.56c-.18.69-.73 1.26-1.41 1.44L17 18.5V21h-2v-6h6v2zM19 7h2v2h-2V7zm2-2h-2V3.08c1.1 0 2 .92 2 1.92zm-6-2h2v2h-2V3zm4 8h2v2h-2v-2zM9 21H7v-2h2v2zM5 9H3V7h2v2zm0-5.92V5H3c0-1 1-1.92 2-1.92zM5 17H3v-2h2v2zM9 5H7V3h2v2zm4 0h-2V3h2v2zm0 16h-2v-2h2v2zm-8-8H3v-2h2v2zm0 8.08C3.9 21.08 3 20 3 19h2v2.08z"></path>
                        </svg>
                      </React.Fragment>
                    ) : (
                      <svg
                        focusable="false" aria-label="" viewBox="0 0 24 24" height="36" width="36"
                        fill="#000">
                        <path d="M3 3h18v18H3z"></path>
                      </svg>
                    )}
                  </span>
                </div>
                <div className="button">
                  <span className="flatbutton" draggable="false" onClick={this.editCancel.bind(this)}>{props.editDoneLabel}</span>
                </div>
              </div>
            )}
            <div ref={this.hightlight} className="hightlight-area">
              {state.hightlightItem.map((data, k)=>(
                <div key={k} className="rect" style={{
                  width: `${data.width}px`,
                  height: `${data.height}px`,
                  left: `${data.sx}px`,
                  top: `${data.sy}px`
                }}>
                  <span className="close" onClick={this.clearHightlight.bind(this, k)}>
                    <svg viewBox="0 0 1024 1024" width="16" height="16">
                      <path d="M896 224l-96-96-288 288-288-288-96 96 288 288-288 288 96 96 288-288 288 288 96-96-288-288 288-288z"/>
                    </svg>
                  </span>
                </div>
              ))}
            </div>
            <div ref={this.black} className="black-area">
              {state.blackItem.map((data, k)=>(
                <div key={k} className="rect" style={{
                  width: `${data.width}px`,
                  height: `${data.height}px`,
                  left: `${data.sx}px`,
                  top: `${data.sy}px`
                }}>
                  <span className="close" onClick={this.clearBlack.bind(this, k)}>
                    <svg viewBox="0 0 1024 1024" width="16" height="16">
                      <path d="M896 224l-96-96-288 288-288-288-96 96 288 288-288 288 96 96 288-288 288 288 96-96-288-288 288-288z"/>
                    </svg>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mobile-feedBack-window" data-html2canvas-ignore="true" style={{height: `${state.winHeight}px`}}>
            <div className="header">
              <div className="left">
                {state.showInformation ? (
                  <span className={`close btn${props.disabled ? ' disabled':''}`} onClick={this.showInformation.bind(this)}>
                    <ArrowBack className='svgIcon' />
                  </span>
                ) : (
                  <span className={`close btn${props.disabled ? ' disabled':''}`} onClick={this.cancel.bind(this)}>
                    <svg focusable="false" aria-label="CANCEL" fill="white" viewBox="0 0 24 24" height="24" width="24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg>
                  </span>
                )}
                <label>{props.title}</label>
              </div>
              {state.showInformation ? null : (
                <span style={{position:'relative'}} className={`send btn${props.disabled ? ' disabled':''}`} onClick={this.send.bind(this)}>
                  {props.disabled && (
                    <div className="loading-icon">
                      <svg viewBox="0 0 40 40" style={{width: '40px', height: '40px', position: 'relative'}}>
                        <circle cx="20" cy="20" r="18.25" fill="none" strokeWidth="3.5"
                        strokeMiterlimit="20"
                        style={{stroke: '#fff', strokeLinecap: 'round'}}></circle>
                      </svg>
                    </div>
                  )}
                  <svg focusable="false" aria-label="SEND" fill="white" viewBox="0 0 24 24" height="24" width="24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                </span>
              )}
            </div>
            <div className="main">
              <div className="feedback-area">
              {state.showInformation ? 
                <div style={{background:'#fff',overflowY:'auto',padding:10,position:'fixed',zIndex:5,top:56,left:0,width:'100%',height:'calc(100% - 56px)',wordBreak:'break-word', msWordBreak:'break-word'}}>
                  {Object.keys(this.sysInfo).map((dt,i)=>{
                    if(typeof this.sysInfo?.[dt as keyof ISysInfo]==='object' && dt!== 'mimeType') {
                      return(
                        <div key={i} style={{marginBottom:'1em'}}>
                          <span style={{color:'#000000',textDecoration:'underline',marginBottom:'1em'}}><strong>{dt}: </strong></span><br />
                          {Object.keys(this.sysInfo[dt as keyof ISysInfo]).map((dd,ii)=>(
                            <p style={{marginBottom:'.5em',marginLeft:10}} key={`${i}-${ii}`}>
                              <span style={{color:'#000000'}} key={`${i}-${ii}-0`}><strong>{dd}: </strong></span><br />
                              <span style={{color:'#000000',marginLeft:10}} key={`${i}-${ii}-1`}>{this.sysInfo?.[dt as keyof ISysInfo]?.[dd].toString()}</span>
                            </p>
                          ))}
                        </div>
                      )
                      } else if(dt!== 'mimeType'){
                        return(
                          <p key={i} style={{marginBottom:'1em'}}>
                            <span style={{color:'#000000'}} key={`${i}-0`}><strong>{dt}: </strong></span><br />
                            <span style={{color:'#000000',marginLeft:10}} key={`${i}-1`}>{this.sysInfo?.[dt as keyof ISysInfo].toString()}</span>
                          </p>
                        )
                      }
                    })}
                  </div>
                : null}
                {this.props.rating && (
                  <div key={0} style={{display:'flex',alignItems: 'center',justifyContent:'center',margin:'20px 0'}}>
                    <Rating
                      classes={{sizeLarge:'fbLabel',iconEmpty:'iconEmpty'}}
                      name="hover-feedback"
                      value={this.state.feedbackVal}
                      onChange={(event, newValue)=>this.setState({feedbackVal:newValue})}
                      size="large"
                      disabled={props.disabled}
                    />
                  </div>
                )}
                <textarea disabled={props.disabled} placeholder={props.placeholder} ref={this.textarea} defaultValue={state.text} onChange={(e) => {
                  this.setState({
                      text: e.target.value,
                      textError: '',
                  })
                }}></textarea>
                {state.textError ? <div className="required-tip">{state.textError}</div>:null }
              </div>
              <div className="screenshot">
                <div className="shot-switch clearfix">
                  <div className={`checkbox${props.disabled ? ' disabled':''}`} onClick={this.checkboxHandle.bind(this)}>
                    <svg className={`checkbox-icon ${state.shotOpen ? '' : 'active'}`} focusable="false"
                      aria-label="" fill="#757575" viewBox="0 0 24 24" height="24" width="24">
                        <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                    </svg>
                    <svg className={`checkbox-icon ${state.shotOpen ? 'active' : ''}`} focusable="false"
                      aria-label="" fill={props.theme || '#3986FF'} viewBox="0 0 24 24" height="24"
                      width="24">
                      <path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                    </svg>
                  </div>
                  <label>{`${props.checkboxLabel} (beta)`}</label>
                </div>
                {state.shotOpen && (
                  <div className="screenshot-area">
                    {state.loading && (
                      <div className="loading-icon">
                        <svg viewBox="0 0 40 40" style={{width: '40px', height: '40px', position: 'relative'}}>
                          <circle cx="20" cy="20" r="18.25" fill="none" strokeWidth="3.5"
                          strokeMiterlimit="20"
                          style={{stroke: props.theme || 'rgb(57, 134, 255)', strokeLinecap: 'round'}}></circle>
                        </svg>
                      </div>
                    )}
                    <div className="screenshot">
                      <img id="screenshotPrev" ref={this.screenshotPrev} src=""/>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="legal">{this.props.license || <LegalComponent onclick={this.showInformation.bind(this)} />}</div>
          </div>
        )}
        <canvas ref={this.canvas} id="feedbackCanvas" data-html2canvas-ignore="true" onMouseDown={this.canvasMouseDown.bind(this)}></canvas>
        <canvas ref={this.shadowCanvas} id="shadowCanvas"></canvas>

        <style jsx>{`
          #googleFeedback {
            width: 100%;
            height: 100%;
            position: absolute;
            padding: 0px;
            border: none;
            left: 0px;
            top: 0px;
            z-index: 2450; }
            #googleFeedback * {
            padding: 0px;
            box-sizing: border-box;
            font-family: "PingFangSC-Regular", "Microsoft YaHei", STHeiti, Helvetica, Arial, sans-serif; }
          @keyframes feedbackLoading {
            0% {
            transform: scale(0.7) rotate(0deg); }
            100% {
            transform: scale(0.7) rotate(1800deg); } }
          @keyframes feedbackSubmitting {
            0% {
            transform: scale(1) rotate(0deg); }
            100% {
            transform: scale(1) rotate(1800deg); } }
          @keyframes feedbackLoadingCircle {
              0% {
              stroke-dasharray: 1, 200;
              stroke-dashoffset: 0; }
              50% {
              stroke-dasharray: 89, 200;
              stroke-dashoffset: -35; }
              100% {
              stroke-dasharray: 89.2677, 200;
              stroke-dashoffset: -124; } }
              #googleFeedback .feedback-submiting-icon {
              position: fixed;
              z-index: 2480;
              left: 50%;
              top: 50%;
              margin-left: -20px;
              margin-top: -20px;
              width: 40px;
              height: 40px;
              animation: feedbackSubmitting 10s linear 0ms infinite; }
              #googleFeedback .feedback-submiting-icon circle {
                  animation: feedbackLoadingCircle 2000ms ease-in-out 0ms infinite; }
              #googleFeedback .feedback-window {
              width: 100%;
              height: 100%;
              position: relative; }
              #googleFeedback .feedback-window .dialog-mask {
                  position: absolute;
                  z-index: 999;
                  width: 100%;
                  height: 100%;
                  background: none;
                  left: 0px;
                  top: 0px;
                  cursor: default; }
              #googleFeedback .feedback-window .hightlight-area {
                  width: 0px;
                  height: 0px;
                  position: absolute;
                  left: 0px;
                  top: 0px;
                  z-index: 998; }
                  #googleFeedback .feedback-window .hightlight-area .rect {
                  position: absolute;
                  background: none; }
                  #googleFeedback .feedback-window .hightlight-area .rect:hover {
                      cursor: default;
                      background: rgba(55, 131, 249, 0.2); }
                      #googleFeedback .feedback-window .hightlight-area .rect:hover .close {
                      display: flex; }
                  #googleFeedback .feedback-window .hightlight-area .rect .close {
                      width: 24px;
                      height: 24px;
                      background: #FFF;
                      border-radius: 50%;
                      justify-content: center;
                      align-items: center;
                      color: #999;
                      position: absolute;
                      right: -12px;
                      top: -12px;
                      cursor: pointer;
                      display: none;
                      user-select: none; }
              #googleFeedback .feedback-window .black-area {
                  width: 0px;
                  height: 0px;
                  position: absolute;
                  left: 0px;
                  top: 0px;
                  z-index: 999; }
                  #googleFeedback .feedback-window .black-area .rect {
                  position: absolute;
                  background: #000; }
                  #googleFeedback .feedback-window .black-area .rect:hover {
                      cursor: default;
                      background: rgba(0, 0, 0, 0.8); }
                      #googleFeedback .feedback-window .black-area .rect:hover .close {
                      display: flex; }
                  #googleFeedback .feedback-window .black-area .rect .close {
                      width: 24px;
                      height: 24px;
                      background: #FFF;
                      border-radius: 50%;
                      justify-content: center;
                      align-items: center;
                      color: #999;
                      position: absolute;
                      right: -12px;
                      top: -12px;
                      cursor: pointer;
                      display: none;
                      user-select: none; }
              #googleFeedback .feedback-window .dialog {
                  width: 360px;
                  min-height: 443px;
                  background: #FFF;
                  box-shadow: rgba(0, 0, 0, 0.137255) 0px 24px 38px 3px, rgba(0, 0, 0, 0.117647) 0px 9px 46px 8px, rgba(0, 0, 0, 0.2) 0px 11px 15px -7px;
                  border-radius: 2px;
                  position: fixed;
                  left: 50%;
                  top: 50%;
                  margin-left: -180px;
                  margin-top: -360px;
                  z-index: 1000; }
                  #googleFeedback .feedback-window .dialog .title {
                  height: 56px;
                  line-height: 56px;
                  color: #FFF;
                  padding: 0px 16px;
                  font-size: 16px; }
              #googleFeedback .feedback-window .feedback-area {
                  width: 100%;
                  padding: 0px 0px 0px 0px;
                  position: relative; }
                  #googleFeedback .feedback-window .feedback-area textarea {
                  padding: 18px 16px 12px 18px;
                  display: block;
                  width: 100%;
                  height: 186px;
                  resize: none;
                  outline: none;
                  border: none;
                  font-size: 14px; }
                  #googleFeedback .feedback-window .feedback-area textarea::-webkit-scrollbar {
                      width: 5px;
                      height: 5px;
                      background-color: #f0f0f0; }
                  #googleFeedback .feedback-window .feedback-area textarea::-webkit-scrollbar-track {
                      background-color: #f0f0f0; }
                  #googleFeedback .feedback-window .feedback-area textarea::-webkit-scrollbar-thumb {
                      background-color: #aaa; }
                  #googleFeedback .feedback-window .feedback-area .required-tip {
                  position: absolute;
                  width: 326px;
                  left: 16px;
                  top: 50px;
                  height: 32px;
                  line-height: 32px;
                  border-top: 2px solid #db4437;
                  color: #db4437;
                  font-size: 12px; }
              #googleFeedback .feedback-window .shot-switch {
                  flex: 1;
                  height: 48px;
                  padding: 8px 16px 8px 8px;
                  line-height: 32px;
                  background: #FAFAFA;
                  display: flex;
                  align-items: center; }
                  #googleFeedback .feedback-window .shot-switch .checkbox {
                  width: 32px;
                  height: 32px;
                  position: relative;
                  cursor: pointer; }
                  #googleFeedback .feedback-window .shot-switch .checkbox .checkbox-icon {
                      position: absolute;
                      width: 24px;
                      height: 24px;
                      left: 4px;
                      top: 4px;
                      transform: scale(0);
                      opacity: 0;
                      transition: all 400ms ease-out; }
                  #googleFeedback .feedback-window .shot-switch .checkbox .active {
                      opacity: 1;
                      transform: scale(1); }
                  #googleFeedback .feedback-window .shot-switch label {
                  color: #000;
                  font-size: 14px; }
              #googleFeedback .feedback-window .screenshot-area {
                  width: 100%;
                  height: 192px;
                  background: #EEE;
                  position: relative; }
                  .loading-icon {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  margin-left: -20px;
                  margin-top: -20px;
                  width: 40px;
                  height: 40px;
                  z-index:2;
                  animation: feedbackLoading 10s linear 0ms infinite; }
                  .loading-icon circle {
                      animation: feedbackLoadingCircle 2000ms ease-in-out 0ms infinite; }
                  #googleFeedback .feedback-window .screenshot-area .loading .loading-text {
                  text-align: center;
                  color: #999;
                  font-size: 14px;
                  position: absolute;
                  display: block;
                  width: 100%;
                  height: 24px;
                  line-height: 24px;
                  top: 70%;
                  left: 0px; }
                  #googleFeedback .feedback-window .screenshot-area .screenshot {
                  width: 100%;
                  height: 100%;
                  display: flex;
                  position: relative;
                  cursor: pointer; }
                  #googleFeedback .feedback-window .screenshot-area .screenshot:hover .to-edit {
                      opacity: 1; }
                  #googleFeedback .feedback-window .screenshot-area .screenshot .to-edit {
                      width: 224px;
                      height: 112px;
                      position: absolute;
                      left: 50%;
                      top: 50%;
                      margin-left: -112px;
                      margin-top: -56px;
                      padding: 16px;
                      border-radius: 6px;
                      transition: all 250ms ease;
                      opacity: 0;
                      background: rgba(255, 255, 255, 0.75); }
                      #googleFeedback .feedback-window .screenshot-area .screenshot .to-edit:hover svg {
                      fill: #3986FF; }
                      #googleFeedback .feedback-window .screenshot-area .screenshot .to-edit:hover .edit-label {
                      color: #3986FF;
                      margin-bottom: 10px }
                      #googleFeedback .feedback-window .screenshot-area .screenshot .to-edit .edit-icon {
                      width: 48px;
                      height: 48px;
                      margin: 0px auto; }
                      #googleFeedback .feedback-window .screenshot-area .screenshot .to-edit .edit-label {
                      width: 100%;
                      text-align: center;
                      display: block;
                      color: #757575;
                      margin-top: 12px;
                      font-size: 14px; }
                  #googleFeedback .feedback-window .screenshot-area .screenshot img {
                      max-height: 100%;
                      max-width: 100%;
                      margin: auto; }
              #googleFeedback .feedback-window .legal {
                  width: 100%;
                  color: #757575;
                  font-size: 12px;
                  padding: 12px 16px;
                  line-height: 1.5;
                  background: #FAFAFA; }
              #googleFeedback .feedback-window .legal p {
                  font-size: 12px
              }
                  #googleFeedback .feedback-window .legal a {
                  color: #3986FF;
                  font-size: 12px; }
              #googleFeedback .feedback-window .actions {
                  width: 100%;
                  padding: 0px 8px;
                  height: 56px;
                  border-top: solid 1px #E0E0E0;
                  display: flex;
                  justify-content: flex-end;
                  background: #FAFAFA; }
                  #googleFeedback .feedback-window .actions .flatbutton {
                  margin-top: 10px;
                  padding: 0px 16px;
                  font-size: 14px;
                  height: 36px;
                  line-height: 36px;
                  border-radius: 3px;
                  color: #333;
                  transition: all 400ms ease;
                  cursor: pointer;
                  user-select: none; }
                  #googleFeedback .feedback-window .actions .flatbutton:not(.disabled):hover {
                      background: #EEE; }
                  #googleFeedback .feedback-window .actions .confirm {
                  margin-left: 8px; }
              #googleFeedback .feedback-window .tool-bar {
                  position: fixed;
                  left: 50%;
                  top: 60%;
                  margin-left: -115px;
                  width: 232px;
                  background: #FFF;
                  height: 56px;
                  border-radius: 2px;
                  box-shadow: rgba(0, 0, 0, 0.137255) 0px 24px 38px 3px, rgba(0, 0, 0, 0.117647) 0px 9px 46px 8px, rgba(0, 0, 0, 0.2) 0px 11px 15px -7px;
                  z-index: 2450; }
                  #googleFeedback .feedback-window .tool-bar .move {
                  float: left;
                  width: 40px;
                  height: 56px;
                  padding: 0px 12px;
                  cursor: move; }
                  #googleFeedback .feedback-window .tool-bar .tool {
                  float: left;
                  width: 56px;
                  height: 56px;
                  padding: 10px;
                  cursor: pointer;
                  position: relative;
                  user-select: none; }
                  #googleFeedback .feedback-window .tool-bar .tool:hover {
                      background: #F0F0F0; }
                  #googleFeedback .feedback-window .tool-bar .hight-light:hover:before {
                  display: block; }
                  #googleFeedback .feedback-window .tool-bar .hight-light:before {
                  content: attr(data-label);
                  display: none;
                  padding: 6px 12px;
                  font-size: 12px;
                  background: #676767;
                  border-radius: 3px;
                  color: #FFF;
                  position: absolute;
                  left: 50%;
                  bottom: -55px;
                  transform: translateX(-50%);
                  text-align: center;
                  width: 150px; }
                  #googleFeedback .feedback-window .tool-bar .hide:hover:before {
                  display: block; }
                  #googleFeedback .feedback-window .tool-bar .hide:before {
                  display: none;
                  content: attr(data-label);
                  padding: 6px 12px;
                  font-size: 12px;
                  background: #676767;
                  color: #FFF;
                  border-radius: 3px;
                  position: absolute;
                  left: 50%;
                  bottom: -55px;
                  transform: translateX(-50%);
                  text-align: center;
                  width: 150px; }
                  #googleFeedback .feedback-window .tool-bar .text span {
                  color: #333;
                  line-height: 36px;
                  text-align: center;
                  font-size: 32px; }
                  #googleFeedback .feedback-window .tool-bar .text:hover:before {
                  display: block; }
                  #googleFeedback .feedback-window .tool-bar .text:before {
                  display: none;
                  content: '添加描述文字';
                  padding: 6px 12px;
                  font-size: 12px;
                  background: #676767;
                  color: #FFF;
                  border-radius: 3px;
                  position: absolute;
                  left: 50%;
                  bottom: -35px;
                  transform: translateX(-50%);
                  text-align: center;
                  width: 80px; }
                  #googleFeedback .feedback-window .tool-bar .tool-active {
                  background: #E0E0E0; }
                  #googleFeedback .feedback-window .tool-bar .tool-active:hover {
                      background: #E0E0E0; }
                  #googleFeedback .feedback-window .tool-bar .button {
                  float: right;
                  height: 56px;
                  cursor: pointer;
                  margin-right: 10px;
                  background: #FFF; }
                  #googleFeedback .feedback-window .tool-bar .button .flatbutton {
                      display: block;
                      height: 36px;
                      line-height: 36px;
                      border-radius: 3px;
                      padding: 0px 8px;
                      float: right;
                      color: #3986FF;
                      font-size: 14px;
                      text-align: center;
                      min-width: 64px;
                      margin-top: 10px;
                      background: #FFF; }
                      #googleFeedback .feedback-window .tool-bar .button .flatbutton:not(.disabled):hover {
                      background: #EEE; }
              #googleFeedback .mobile-feedBack-window {
              position: fixed;
              width: 100%;
              height: 100%;
              left: 0px;
              top: 0px;
              background: #FFF;
              z-index: 998;
              box-sizing: border-box;
              display: flex;
              flex-direction: column; }
              #googleFeedback .mobile-feedBack-window .header {
                  width: 100%;
                  height: 50px;
                  background: #3986FF;
                  line-height: 50px;
                  color: #FFF;
                  display: flex;
                  justify-content: space-between; }
                  #googleFeedback .mobile-feedBack-window .header .left {
                  display: flex; }
                  .btn {
                  width: 50px;
                  height: 50px;
                  padding-top: 13px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  cursor:pointer }
                  #googleFeedback .mobile-feedBack-window .header label {
                  font-size: 16px;
                  margin-left: 3vw; }
              #googleFeedback .mobile-feedBack-window .main {
                  flex: 1;
                  display: flex;
                  flex-direction: column; }
              #googleFeedback .mobile-feedBack-window .feedback-area {
                  width: 100%;
                  min-height: 196px;
                  padding: 18px 16px 12px 18px;
                  position: relative;
                  flex: 1; }
                  #googleFeedback .mobile-feedBack-window .feedback-area textarea {
                  display: block;
                  width: 100%;
                  height: 100%;
                  resize: none;
                  outline: none;
                  border: none;
                  font-size: 14px; }
                  #googleFeedback .mobile-feedBack-window .feedback-area textarea::-webkit-scrollbar {
                      width: 5px;
                      height: 5px;
                      background-color: #f0f0f0; }
                  #googleFeedback .mobile-feedBack-window .feedback-area textarea::-webkit-scrollbar-track {
                      background-color: #f0f0f0; }
                  #googleFeedback .mobile-feedBack-window .feedback-area textarea::-webkit-scrollbar-thumb {
                      background-color: #aaa; }
                  #googleFeedback .mobile-feedBack-window .feedback-area .required-tip {
                  position: absolute;
                  width: calc(100% - 36px);
                  left: 16px;
                  top: 50px;
                  height: 32px;
                  line-height: 32px;
                  border-top: 2px solid #db4437;
                  color: #db4437;
                  font-size: 12px; }
              #googleFeedback .mobile-feedBack-window .screenshot {
                  width: 90%;
                  min-height: 64px;
                  margin: 0px auto;
                  margin-bottom: 16px;
                  background: #FAFAFA;
                  border-radius: 3px;
                  display: flex;
                  align-items: center;
                  position:sticky;
                  bottom:0;
                  width:100% }
              #googleFeedback .mobile-feedBack-window .shot-switch {
                  flex: 1;
                  height: 48px;
                  padding: 8px 16px 8px 8px;
                  line-height: 32px;
                  background: #FAFAFA; }
                  #googleFeedback .mobile-feedBack-window .shot-switch .checkbox {
                  width: 32px;
                  height: 32px;
                  float: left;
                  position: relative;
                  cursor: pointer; }
                  #googleFeedback .mobile-feedBack-window .shot-switch .checkbox .checkbox-icon {
                      position: absolute;
                      width: 24px;
                      height: 24px;
                      left: 4px;
                      top: 4px;
                      transform: scale(0);
                      opacity: 0;
                      transition: all 400ms ease-out; }
                  #googleFeedback .mobile-feedBack-window .shot-switch .checkbox .active {
                      opacity: 1;
                      transform: scale(1); }
                  #googleFeedback .mobile-feedBack-window .shot-switch label {
                  float: left;
                  color: #000;
                  font-size: 14px; }
              #googleFeedback .mobile-feedBack-window .screenshot-area {
                  width: 64px;
                  height: 64px;
                  background: #EEE;
                  position: relative; }
                  #googleFeedback .mobile-feedBack-window .screenshot-area .loading-icon {
                  position: absolute;
                  left: 50%;
                  top: 50%;
                  margin-left: -20px;
                  margin-top: -20px;
                  width: 40px;
                  height: 40px;
                  z-index: 2;
                  animation: feedbackLoading 10s linear 0ms infinite; }
                  #googleFeedback .mobile-feedBack-window .screenshot-area .loading-icon circle {
                      animation: feedbackLoadingCircle 2000ms ease-in-out 0ms infinite; }
                  #googleFeedback .mobile-feedBack-window .screenshot-area .screenshot {
                  width: 100%;
                  height: 100%;
                  background: #EEE;
                  display: flex;
                  position: relative;
                  cursor: pointer; }
                  #googleFeedback .mobile-feedBack-window .screenshot-area .screenshot img {
                      max-height: 100%;
                      max-width: 100%;
                      margin: auto; }
              #googleFeedback .mobile-feedBack-window .legal {
                  width: 100%;
                  min-height: 72px;
                  color: #757575;
                  font-size: 12px;
                  padding: 16px 20px;
                  line-height: 1.8;
                  background: #FAFAFA; }
                  #googleFeedback .mobile-feedBack-window .legal a {
                  color: #3986FF;
                  font-size: 12px; }
              #googleFeedback .mobile-feedBack-window .canvas-area {
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  left: 0px;
                  top: 0px; }
          #googleFeedback #feedbackCanvas {
              width: 100%;
              height: 100%;
              position: absolute;
              left: 0px;
              top: 0px;
              z-index: 997;
              cursor: crosshair; }
          #googleFeedback #shadowCanvas {
              width: 100%;
              height: 100%;
              position: absolute;
              left: 0px;
              top: 0px;
              z-index: 996;
              pointer-events: none; }
          .svgIcon svg{
              color:'#ffffff';
          }
          .disabled{
              user-select: none !important;
              cursor: unset !important
          }
          .snackbarIcon svg{
            color:#fff
          }
          .fbLabel{
            font-size: 3rem !important;
          }
          .iconEmpty{
            color: rgba(0,0,0,0.3) !important;
          }
      `}</style>
      </div>
    )
  }
}

const mapToProps=(state: State)=>({
  user:!state.user || state.user===null ? null : {
      username:`@${state.user.username}`,
      name:state.user.name,
      email:state.user.email
  }
})

const Feedback = connect(mapToProps)(withSnackbar(FeedbackClass))
export default Feedback;