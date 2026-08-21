const path=require('path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const output=path.resolve(root,'..','..','..','outputs');
const url=`file:///${path.join(root,'index.html').replace(/\\/g,'/')}`;

const baseSave={version:1,settings:{textSpeed:5,autoDelay:700,volume:0,musicVolume:84,sfxVolume:88,muted:true,reducedMotion:true},endings:[],echoes:[],read:[],saves:[null,null,null,null,null,null],zeroTitleSeen:false,decoder:{solved:false,verified:[],attempts:0}};
const state=nodeId=>({player:'测试听众',hero:'江临',nodeId,route:null,affinity:{lincheng:0,tangsha:0,sumi:0,guwanqing:0,jiyao:0},flags:{},history:[],startedAt:Date.now(),currentBg:'v4_studio_alert',currentPortrait:null,currentExpression:'default'});

async function bootAt(browser,nodeId,viewport={width:1440,height:900}){
  const page=await browser.newPage({viewport,isMobile:viewport.width<900,hasTouch:viewport.width<900});
  const save=JSON.parse(JSON.stringify(baseSave));save.autoSave={state:state(nodeId),time:Date.now()};
  await page.addInitScript(value=>localStorage.setItem('after-zero-save-v1',JSON.stringify(value)),save);
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#boot-screen')?.classList.contains('complete'));
  await page.click('#continue-btn');
  await page.waitForSelector('#story-minigame:not(.hidden)');
  const layout=await page.locator('.minigame-shell').evaluate(el=>{const r=el.getBoundingClientRect();return{left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth};});
  if(layout.left<-1||layout.top<-1||layout.right>layout.width+1||layout.bottom>layout.height+1||layout.scrollWidth>layout.width+1)throw new Error(`minigame viewport overflow at ${nodeId}: ${JSON.stringify(layout)}`);
  return page;
}
async function slider(page,id,value){await page.locator(id).evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},value);}
async function finish(page,name){await page.waitForSelector('.mg-success');await page.screenshot({path:path.join(output,`v48-${name}.png`),fullPage:true});await page.click('.mg-success .mg-submit');await page.waitForFunction(()=>document.querySelector('#story-minigame')?.classList.contains('hidden'));}

(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge',args:['--disable-gpu']});
  let page=await bootAt(browser,'v48_game_city');
  for(const [i,count] of [[0,2],[1,3],[2,1]])for(let n=0;n<count;n++)await page.click(`[data-city="${i}"][data-delta="1"]`);
  await page.click('#city-lock');await finish(page,'city');await page.close();

  page=await bootAt(browser,'v48_game_crisis',{width:390,height:844});
  await page.waitForTimeout(7400);await page.waitForSelector('.minigame-errors.active');
  const errorCount=await page.locator('.mg-error-window').count();if(errorCount<7||errorCount>9)throw new Error(`unexpected crisis error count ${errorCount}`);
  await page.screenshot({path:path.join(output,'v48-crisis-errors-phone.png'),fullPage:true});
  await page.locator('.minigame-errors').click({position:{x:190,y:400}});
  await page.click('[data-crisis="freq"][data-v=".2"]');await page.click('[data-crisis="freq"][data-v=".2"]');
  await page.click('[data-crisis="route"][data-v="RED"]');await page.click('[data-crisis="delay"][data-v="-13"]');
  await page.fill('#crisis-command','保持频道');await page.click('#crisis-submit');await finish(page,'crisis-phone');await page.close();

  page=await bootAt(browser,'v48_game_radio');await slider(page,'#radio-freq',93);await slider(page,'#radio-noise',27);await slider(page,'#radio-field',61);await page.click('#radio-lock');await finish(page,'radio');await page.close();
  page=await bootAt(browser,'v48_game_camera');const cameraScroll=await page.locator('.minigame-body').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight}));if(cameraScroll.scroll>cameraScroll.client+1)throw new Error(`desktop camera requires scrolling: ${JSON.stringify(cameraScroll)}`);await page.screenshot({path:path.join(output,'v48-camera-gameplay.png'),fullPage:true});await slider(page,'#cam-focus',8);await slider(page,'#cam-light',6);await slider(page,'#cam-frame',7);const cameraValues=await page.locator('.mg-parameter output').allTextContents();if(cameraValues.join('|')!=='F/8|EV+1|POINT 7')throw new Error(`camera parameter values unclear: ${cameraValues.join('|')}`);await page.fill('#cam-time','00:13');await page.click('#cam-submit');await finish(page,'camera');await page.close();
  page=await bootAt(browser,'v48_game_code');await page.click('[data-code="02"]');await page.fill('#code-command','保留记录');await page.click('#code-submit');await finish(page,'code');await page.close();
  page=await bootAt(browser,'v48_game_medical');for(const [id,level] of [['A','RED'],['B','YELLOW'],['C','RED']])await page.click(`[data-case="${id}"][data-level="${level}"]`);await page.fill('#medical-command','继续抢救');await page.click('#medical-submit');await finish(page,'medical');await page.close();
  page=await bootAt(browser,'v48_game_folklore');await page.screenshot({path:path.join(output,'v48-folklore-gameplay.png'),fullPage:true});await page.click('[data-rule="2"]');await page.click('[data-rule="4"]');await page.click('#rule-check');await page.fill('#archive-name','纪遥');await page.click('#archive-submit');await finish(page,'folklore');await page.close();
  page=await bootAt(browser,'v48_game_evidence');for(const item of ['相片','病历','收音机','怪谈','代码'])await page.click(`[data-evidence="${item}"]`);await finish(page,'evidence');await page.close();
  page=await bootAt(browser,'v48_game_finalsend',{width:844,height:390});await page.screenshot({path:path.join(output,'v48-finalsend-gameplay-landscape.png'),fullPage:true});for(const sequence of [[2,4,1],[3,5,2,4],[2,1,5,3,4]]){await page.waitForFunction(()=>document.querySelector('.mg-sequence')?.dataset.ready==='true');for(const n of sequence)await page.click(`[data-send="${n}"]`);}await page.waitForSelector('#operator-name');await page.fill('#operator-name','江临');await page.click('#operator-submit');await page.fill('#final-message','请记得我们曾在这里回答');await page.click('#message-submit');await finish(page,'finalsend-landscape');await page.close();
  await browser.close();console.log('V4.8 nine minigames valid, including inactivity errors, text input, phone portrait and landscape.');
})().catch(error=>{console.error(error);process.exit(1);});
