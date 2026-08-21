(function(){
  'use strict';

  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const clean=value=>String(value||'').trim().replace(/[“”‘’"'，。！？\s]/g,'').toLowerCase();

  const DEFINITIONS={
    city:{theme:'mg-city',kicker:'DAY 03 · CITY RELAY',title:'城市信号救援',objective:'将六格反相信号分配到三个城市节点'},
    crisis:{theme:'mg-crisis',kicker:'DAY 05 · EMERGENCY OVERRIDE',title:'00:13紧急抢修',objective:'保留被系统标红的频道并完成紧急广播'},
    radio:{theme:'mg-radio',kicker:'LIN CHENG · VOICE ANCHOR',title:'让她的声音持续抵达',objective:'从覆盖广播中锁定林澄的真实声场'},
    camera:{theme:'mg-camera',kicker:'TANG SHA · IMPOSSIBLE FRAME',title:'照片之外的那一天',objective:'还原不可能照片的拍摄参数与时间'},
    code:{theme:'mg-code',kicker:'SU MI · LOGIC PATCH',title:'修改正确但残酷的规则',objective:'阻止系统删除无法登记的人'},
    medical:{theme:'mg-medical',kicker:'GU WANQING · NIGHT SHIFT',title:'无人签字的病历',objective:'依据热线与生命体征重新分配救援'},
    folklore:{theme:'mg-folklore',kicker:'JI YAO · RULE ARCHIVE',title:'第六卷不存在',objective:'找出被异常篡改的守则并登记被删除者'},
    evidence:{theme:'mg-finale',kicker:'TRUE SIGNAL · PHASE 01',title:'五线证物交叉验证',objective:'按证物形成的时间顺序打开第六频道'},
    finalsend:{theme:'mg-finale',kicker:'TRUE SIGNAL · PHASE 02',title:'零点之后',objective:'重建回传序列并确认终端操作员'}
  };

  class AfterZeroMinigames{
    constructor(root,audio){
      this.root=root;this.audio=audio||{};this.body=$('#minigame-body',root);this.shell=$('.minigame-shell',root);
      this.title=$('#minigame-title',root);this.kicker=$('#minigame-kicker',root);this.progress=$('#minigame-progress',root);
      this.objective=$('#minigame-objective',root);this.feedbackEl=$('#minigame-feedback',root);this.pauseButton=$('#minigame-pause',root);
      this.pauseSheet=$('#minigame-pause-sheet',root);this.errorLayer=$('#minigame-errors',root);this.timers=new Set();this.paused=false;
      this.pauseButton.addEventListener('click',()=>this.togglePause(true));
      $('button',this.pauseSheet).addEventListener('click',()=>this.togglePause(false));
      this.root.addEventListener('pointerdown',event=>{
        if(!this.errorLayer.classList.contains('active'))return;
        event.preventDefault();event.stopPropagation();this.clearErrors();this.ping('choice');this.resetIdle();
      },true);
      document.addEventListener('visibilitychange',()=>{if(document.hidden&&!this.root.classList.contains('hidden'))this.togglePause(true);});
    }
    later(fn,ms){const id=setTimeout(()=>{this.timers.delete(id);fn();},ms);this.timers.add(id);return id;}
    clearTimers(){this.timers.forEach(clearTimeout);this.timers.clear();if(this.idleTimer)clearTimeout(this.idleTimer);this.idleTimer=null;}
    ping(type='step'){const map={step:'consoleStep',wrong:'consoleError',choice:'choice',success:'signal'};const fn=this.audio[map[type]];if(typeof fn==='function')fn.call(this.audio);else if(typeof this.audio.tone==='function')this.audio.tone(type==='wrong'?170:520,.06,.018,'triangle');}
    feedback(message,bad=false){this.feedbackEl.textContent=message;this.feedbackEl.style.color=bad?'#ff6f87':'';}
    setProgress(value){this.progress.textContent=value;}
    start(id,context={}){
      const def=DEFINITIONS[id];if(!def)throw new Error(`Unknown minigame: ${id}`);
      this.clearTimers();this.clearErrors();this.id=id;this.context=context;this.onComplete=context.onComplete;this.paused=false;
      this.shell.className=`minigame-shell ${def.theme}`;this.kicker.textContent=def.kicker;this.title.textContent=def.title;this.objective.textContent=def.objective;
      this.feedback('等待输入');this.setProgress('PHASE 01');this.pauseSheet.classList.add('hidden');this.root.classList.remove('hidden');
      const renderer=this[`render_${id}`];renderer.call(this);this.later(()=>this.body.querySelector('button,input')?.focus(),80);
    }
    finish(detail='信号已经封存',result={}){
      this.clearTimers();this.clearErrors();this.setProgress('COMPLETE');this.feedback('操作完成');this.ping('success');
      this.body.innerHTML=`<section class="mg-success"><div class="mg-seal">✓</div><small>OPERATION ACCEPTED</small><h3>${detail}</h3><p>这次操作已经写入剧情记录。接下来的结果不会被当作自动完成。</p><button class="mg-submit" type="button">返回故事</button></section>`;
      $('.mg-submit',this.body).onclick=()=>{this.root.classList.add('hidden');const cb=this.onComplete;this.onComplete=null;cb?.({game:this.id,completed:true,...result});};
    }
    togglePause(force){this.paused=force;this.pauseSheet.classList.toggle('hidden',!force);this.pauseButton.textContent=force?'已暂停':'暂停';if(force){if(this.idleTimer)clearTimeout(this.idleTimer);}else this.resetIdle();}
    resetIdle(){if(this.id!=='crisis'||this.paused)return;if(this.idleTimer)clearTimeout(this.idleTimer);this.idleTimer=setTimeout(()=>this.spawnErrors(),7200);}
    spawnErrors(){if(this.id!=='crisis'||this.paused)return;this.clearErrors();const count=7+Math.floor(Math.random()*3);const spots=[[3,5],[36,2],[70,5],[80,35],[72,72],[38,78],[2,70],[0,34],[54,18]];
      for(let i=0;i<count;i++){const div=document.createElement('div');div.className='mg-error-window';div.style.left=`${spots[i][0]}%`;div.style.top=`${spots[i][1]}%`;div.style.setProperty('--r',`${(i%2?-1:1)*(2+i%4)}deg`);div.innerHTML=`<b>${i%3===0?'怎能止步于此……':'SIGNAL REJECTED'}</b>ERR_00${13+i} / ${i%2?'不要切断':'操作员未响应'}`;this.errorLayer.appendChild(div);}
      this.errorLayer.classList.add('active');this.feedback('系统正在夺取操作权',true);this.ping('wrong');
    }
    clearErrors(){this.errorLayer.classList.remove('active');this.errorLayer.innerHTML='';}
    bindText(input,button,answers,hints,onCorrect){let wrong=0;const normalized=answers.map(clean);const submit=()=>{if(input.isComposing)return;const value=clean(input.value);if(normalized.includes(value)){this.ping('success');onCorrect(input.value);return;}wrong++;this.ping('wrong');const hint=hints[Math.min(wrong-1,hints.length-1)];this.feedback(hint||'当前输入没有被系统接受',true);input.select();};button.onclick=submit;input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();submit();}});return submit;}

    render_city(){
      const target=[2,3,1],values=[0,0,0],names=['医院中继','学校广播','跨江隧道'];
      const draw=()=>{this.setProgress(`${values.reduce((a,b)=>a+b,0)} / 06`);this.body.innerHTML=`<div class="mg-intro"><small>THREE NODES · SIX PHASE CELLS</small><h3>伤亡名单不是答案，实时信号才是</h3><p>根据回传强度分配六格反相信号。每个节点的安全需求已经显示在波形旁。</p></div><div class="mg-grid">${names.map((name,i)=>`<section class="mg-card"><small>NODE 0${i+1} · NEED ${target[i]}</small><h4>${name}</h4><p>${['急诊设备需要两格稳定载波','人群密集，需要三格连续广播','只需一格打开应急照明'][i]}</p><div class="mg-readout">${'■'.repeat(values[i])}${'□'.repeat(3-values[i])}</div><div class="mg-controls"><button data-city="${i}" data-delta="-1">−</button><button data-city="${i}" data-reset="1">归零</button><button data-city="${i}" data-delta="1">＋</button></div></section>`).join('')}</div><button class="mg-action" id="city-lock">执行全城反相广播</button>`;
        $$('[data-city]',this.body).forEach(btn=>btn.onclick=()=>{const i=+btn.dataset.city;values[i]=btn.dataset.reset?0:Math.max(0,Math.min(3,values[i]+(+btn.dataset.delta)));this.ping();draw();});
        $('#city-lock',this.body).onclick=()=>{if(values.every((v,i)=>v===target[i]))this.finish('三处城市节点同时稳定');else{this.ping('wrong');this.feedback('分配与节点需求不符；伤亡名单正在重新生成',true);}};
      };draw();
    }

    render_crisis(){
      const s={freq:87.1,route:'',delay:null};this.crisisState=s;this.resetIdle();
      const draw=()=>{this.resetIdle();const ready=s.freq===87.5&&s.route==='RED'&&s.delay===-13;this.setProgress(ready?'03 / 04':`${Number(s.freq===87.5)+Number(s.route==='RED')+Number(s.delay===-13)} / 04`);this.body.innerHTML=`<div class="mg-intro"><small>COMMON VARIABLE DELETION IN 13:00</small><h3>系统要求切断红色线路</h3><p>值班记录却显示：只有被标红的线路仍连接屏幕外的观察者。</p></div><div class="mg-grid"><section class="mg-card"><small>CARRIER DRIFT</small><h4>锁定主载波</h4><p>目标 87.5 MHz</p><div class="mg-readout">${s.freq.toFixed(1)} MHz</div><div class="mg-controls"><button data-crisis="freq" data-v="-.2">−0.2</button><button data-crisis="freq" data-v="0">重置</button><button data-crisis="freq" data-v=".2">＋0.2</button></div></section><section class="mg-card"><small>EXTERNAL ROUTE</small><h4>选择保留线路</h4><p>绿色安全，红色被系统拒绝</p><div class="mg-readout">${s.route||'NO ROUTE'}</div><div class="mg-controls"><button data-crisis="route" data-v="SAFE">安全</button><button data-crisis="route" data-v="RED">红线</button><button data-crisis="route" data-v="ZERO">零号</button></div></section><section class="mg-card"><small>PHASE COMPENSATION</small><h4>反向补偿</h4><p>异常比当前时间提前13毫秒</p><div class="mg-readout">${s.delay===null?'—':s.delay+' ms'}</div><div class="mg-controls"><button data-crisis="delay" data-v="-13">−13</button><button data-crisis="delay" data-v="0">0</button><button data-crisis="delay" data-v="13">＋13</button></div></section></div>${ready?`<div class="mg-hint">值班手册最后一行：紧急情况下，不要服从自动断线。输入广播口令“保持频道”。</div><div class="mg-input-row"><input id="crisis-command" autocomplete="off" placeholder="输入紧急广播口令"><button class="mg-submit" id="crisis-submit">执行</button></div>`:'<button class="mg-action" disabled>完成三项抢修后开放紧急终端</button>'}`;
        $$('[data-crisis]',this.body).forEach(btn=>btn.onclick=()=>{const k=btn.dataset.crisis,v=btn.dataset.v;if(k==='freq')s.freq=v==='0'?87.1:Math.round((s.freq+Number(v))*10)/10;if(k==='route')s.route=v;if(k==='delay')s.delay=Number(v);this.ping(k==='route'&&v!=='RED'?'wrong':'step');draw();});
        if(ready){const input=$('#crisis-command',this.body);this.bindText(input,$('#crisis-submit',this.body),['保持频道','保持','holdchannel'],['手册中的四字口令以“保持”开头','完整口令：保持频道'],()=>this.finish('红色线路被保留，删除指令暂时失效'));}
      };draw();
    }

    render_radio(){
      this.body.innerHTML=`<div class="mg-intro"><small>VOICE ANCHOR · LIVE</small><h3>不是最清晰的声音，才是真实的声音</h3><p>将频率、降噪和声场调回林澄在台本之外留下的参数。</p></div><div class="mg-grid"><section class="mg-card"><small>FREQUENCY</small><h4>主持载波</h4><div class="mg-readout" id="radio-freq-out">88</div><input class="mg-action" id="radio-freq" type="range" min="80" max="100" value="88"></section><section class="mg-card"><small>NOISE GATE</small><h4>保留呼吸与心跳</h4><div class="mg-readout" id="radio-noise-out">40</div><input class="mg-action" id="radio-noise" type="range" min="0" max="100" value="40"></section><section class="mg-card"><small>STEREO FIELD</small><h4>监听位置</h4><div class="mg-readout" id="radio-field-out">50</div><input class="mg-action" id="radio-field" type="range" min="0" max="100" value="50"></section></div><div class="mg-hint">旧监听记录：主持载波93 / 降噪27 / 右声场61。过度降噪会连她的心跳一起删除。</div><button class="mg-action" id="radio-lock">开放真实监听</button>`;
      ['freq','noise','field'].forEach(key=>{const input=$(`#radio-${key}`,this.body);input.oninput=()=>{$(`#radio-${key}-out`,this.body).textContent=input.value;this.ping();};});
      $('#radio-lock',this.body).onclick=()=>{const values=['freq','noise','field'].map(k=>+$(`#radio-${k}`,this.body).value);if(Math.abs(values[0]-93)<=1&&Math.abs(values[1]-27)<=2&&Math.abs(values[2]-61)<=2)this.finish('静音键下仍能听见她的心跳');else{this.ping('wrong');this.feedback('声场仍被台本广播覆盖；核对旧监听记录',true);}};
    }

    render_camera(){
      this.body.innerHTML=`<div class="mg-intro mg-camera-intro"><small>FRAME 403 · UNAUTHORED</small><h3>把相机调到照片出现以前</h3><p>调整焦距、曝光和取景位置，让照片背面的时间重新显影。</p></div><div class="mg-camera-workspace"><div class="mg-photo-frame" id="photo-frame"><i class="mg-crosshair"></i><span class="mg-photo-hud">FRAME 403<br>NO AUTHOR</span></div><div class="mg-camera-panel"><section class="mg-card mg-parameter"><small>FOCUS · 焦距</small><output id="cam-focus-out">F/2</output><input id="cam-focus" type="range" min="0" max="10" value="2"><div class="mg-scale"><span>F/0</span><span>F/5</span><span>F/10</span></div></section><section class="mg-card mg-parameter"><small>EXPOSURE · 曝光</small><output id="cam-light-out">EV−2</output><input id="cam-light" type="range" min="0" max="10" value="3"><div class="mg-scale"><span>EV−5</span><span>EV0</span><span>EV+5</span></div></section><section class="mg-card mg-parameter"><small>FRAME · 取景点</small><output id="cam-frame-out">POINT 5</output><input id="cam-frame" type="range" min="0" max="10" value="5"><div class="mg-scale"><span>0</span><span>5</span><span>10</span></div></section><div class="mg-hint">底片残留：F/8 · EV+1 · 取景点7。红色电子钟显示拍摄发生在零点之后。</div><div class="mg-input-row"><input id="cam-time" inputmode="decimal" placeholder="填写拍摄时间，例如00:13"><button class="mg-submit" id="cam-submit">显影</button></div></div></div>`;
      const photo=$('#photo-frame',this.body);const signed=n=>n>0?`+${n}`:n<0?`−${Math.abs(n)}`:'0';const update=()=>{const f=+$('#cam-focus',this.body).value,l=+$('#cam-light',this.body).value,x=+$('#cam-frame',this.body).value;photo.style.setProperty('--blur',`${Math.abs(8-f)*.8}px`);photo.style.setProperty('--bright',`${.45+l*.1}`);photo.style.setProperty('--x',`${20+x*6}%`);$('#cam-focus-out',this.body).textContent=`F/${f}`;$('#cam-light-out',this.body).textContent=`EV${signed(l-5)}`;$('#cam-frame-out',this.body).textContent=`POINT ${x}`;this.ping();};$$('input[type=range]',this.body).forEach(x=>x.oninput=update);update();
      this.bindText($('#cam-time',this.body),$('#cam-submit',this.body),['00:13','0013','0:13'],['照片右下角的电子钟停在零点后的第十三分钟','时间格式：00:13'],()=>{const vals=[+$('#cam-focus',this.body).value,+$('#cam-light',this.body).value,+$('#cam-frame',this.body).value];if(Math.abs(vals[0]-8)<=1&&Math.abs(vals[1]-6)<=1&&Math.abs(vals[2]-7)<=1)this.finish('照片里出现了拍摄者本不该站立的位置');else{this.ping('wrong');this.feedback('时间正确，但画面仍未对焦；核对底片参数',true);}});
    }

    render_code(){
      this.body.innerHTML=`<div class="mg-intro"><small>CORE POLICY · NO SYNTAX ERROR</small><h3>程序没有故障，规则才有</h3><p>选择需要改写的逻辑，并提交新的执行指令。</p></div><section class="mg-card"><div class="mg-code-line"><b>01</b><span>IF signal.owner == <em>PERSON_NOT_FOUND</em></span></div><div class="mg-code-line"><b>02</b><span>THEN archive.status = <em>DELETE_RECORD</em></span></div><div class="mg-code-line"><b>03</b><span>RETURN system.stability + 13</span></div></section><div class="mg-controls" style="margin-top:12px"><button data-code="01">改写身份判断</button><button data-code="02">改写删除指令</button><button data-code="03">改写稳定度</button></div><div class="mg-hint">苏弥留下的注释：语法全部正确。不要修复不会报错的部分；修改系统如何对待“无法登记的人”。</div><div class="mg-input-row"><input id="code-command" autocomplete="off" placeholder="输入允许执行的新指令"><button class="mg-submit" id="code-submit">PATCH</button></div>`;
      let line='';$$('[data-code]',this.body).forEach(btn=>btn.onclick=()=>{line=btn.dataset.code;$$('[data-code]',this.body).forEach(x=>x.classList.toggle('selected',x===btn));this.ping();});
      this.bindText($('#code-command',this.body),$('#code-submit',this.body),['保留记录','保留','keeprecord','retainrecord'],['允许指令包括：删除、隔离、保留','应当保留的不是程序，而是记录。输入“保留记录”'],()=>{if(line==='02')this.finish('删除命令已改写为：保留记录');else{this.ping('wrong');this.feedback('指令正确，但补丁写入了错误行；检查DELETE_RECORD',true);}});
    }

    render_medical(){
      const cases=[{id:'A',name:'无名来电者',info:'呼吸急促 / 背景为隧道警报',target:'RED'},{id:'B',name:'儿童热线',info:'生命体征稳定 / 与监护人失联',target:'YELLOW'},{id:'C',name:'值班医生',info:'血压持续下降 / 未建立本人病历',target:'RED'}],assigned={};
      const draw=()=>{this.body.innerHTML=`<div class="mg-intro"><small>427 RECORDS · ONE NAME MISSING</small><h3>名单上的人需要救，名单外的人也一样</h3><p>根据热线与生命体征重新标记三份关键病历。</p></div><div class="mg-grid">${cases.map(c=>`<section class="mg-card"><small>CASE ${c.id}</small><h4>${c.name}</h4><p>${c.info}</p><div class="mg-readout">${assigned[c.id]||'未分级'}</div><div class="mg-controls"><button data-case="${c.id}" data-level="RED">红</button><button data-case="${c.id}" data-level="YELLOW">黄</button><button data-case="${c.id}" data-level="GREEN">绿</button></div></section>`).join('')}</div>${Object.keys(assigned).length===3?`<div class="mg-hint">系统提示：值班医生预计成功率低于阈值。若仍决定建立救援，请输入“继续抢救”。</div><div class="mg-input-row"><input id="medical-command" placeholder="填写处理意见"><button class="mg-submit" id="medical-submit">签署</button></div>`:''}`;$$('[data-case]',this.body).forEach(btn=>btn.onclick=()=>{assigned[btn.dataset.case]=btn.dataset.level;this.ping();draw();});if(Object.keys(assigned).length===3)this.bindText($('#medical-command',this.body),$('#medical-submit',this.body),['继续抢救','抢救','继续'],['这份处理意见以“继续”开头','完整意见：继续抢救'],()=>{if(cases.every(c=>assigned[c.id]===c.target))this.finish('顾晚晴第一次被写进需要救援的名单');else{this.ping('wrong');this.feedback('分级与热线证据冲突；不要遗漏未建档的值班医生',true);}});};draw();
    }

    render_folklore(){
      const rules=['00:13以后，不要回应没有姓名的来电。','若第六盏灯亮起，请确认身边共有几个人。','听见自己的声音时，立刻删除对应磁带。','档案出现矛盾时，应并列保留全部版本。','任何未登记姓名都不属于真实人员。','有人念出你的名字时，请回答“我在”。'];let selected=new Set();
      const draw=()=>{this.body.innerHTML=`<div class="mg-intro"><small>NIGHT RULES · REVISION 06</small><h3>有两条守则不是在保护你</h3><p>对照已经发生的事件，选出会帮助系统删除人的两条规则。</p></div><div class="mg-rule-grid">${rules.map((r,i)=>`<button class="mg-rule ${selected.has(i)?'selected':''}" data-rule="${i}"><b>0${i+1}</b><span>${r}</span></button>`).join('')}</div><button class="mg-action" id="rule-check">封存被篡改规则</button>`;$$('[data-rule]',this.body).forEach(btn=>btn.onclick=()=>{const i=+btn.dataset.rule;selected.has(i)?selected.delete(i):selected.add(i);this.ping();draw();});$('#rule-check',this.body).onclick=()=>{if(selected.size===2&&selected.has(2)&&selected.has(4))this.renderNameArchive();else{this.ping('wrong');this.feedback('选择与现有证物不符：异常最希望你删除声音与姓名',true);}};};draw();
    }
    renderNameArchive(){this.setProgress('PHASE 02');this.body.innerHTML=`<div class="mg-intro"><small>PERSONNEL ENTRY · ERASED</small><h3>请重新登记被删除者</h3><p>磁带盒残留姓氏“纪”。回放结尾只能听见一个字：“……遥”。</p></div><section class="mg-card" style="max-width:620px;margin:auto"><div class="mg-readout">纪＿</div><div class="mg-input-row"><input id="archive-name" autocomplete="off" placeholder="输入被删除者姓名"><button class="mg-submit" id="archive-submit">登记</button></div></section>`;this.bindText($('#archive-name',this.body),$('#archive-submit',this.body),['纪遥'],['重新播放磁带：姓氏是“纪”','录音尾音是“遥”。完整姓名：纪遥'],()=>this.finish('档案状态：未登记 → 有人记得'));}

    render_evidence(){
      const items=[['病历','无名患者在照片之后收到热线'],['代码','删除命令在最后一次记录后启动'],['相片','红色电子钟首先停在00:13'],['怪谈','守则随后将姓名判定为不存在'],['收音机','最后仍有一道声音回答“我在”']],order=['相片','病历','收音机','怪谈','代码'];let picked=[];
      const draw=()=>{this.setProgress(`${picked.length} / 05`);this.body.innerHTML=`<div class="mg-intro"><small>FIVE ROUTES · ONE CAUSAL CHAIN</small><h3>按事件发生顺序提交五份证物</h3><p>错误顺序会让系统把它们解释成五个互不相关的偶然。</p></div><div class="mg-grid">${items.map(([name,desc])=>`<button class="mg-card ${picked.includes(name)?'selected':''}" data-evidence="${name}" ${picked.includes(name)?'disabled':''}><small>${name}</small><h4>${desc}</h4></button>`).join('')}</div><div class="mg-hint">已提交：${picked.join(' → ')||'尚未提交'}</div><button class="mg-action" id="evidence-reset">清空顺序</button>`;$$('[data-evidence]',this.body).forEach(btn=>btn.onclick=()=>{const name=btn.dataset.evidence;if(name!==order[picked.length]){this.ping('wrong');this.feedback(`第${picked.length+1}份证物无法接在这里；从电子钟停止的瞬间开始`,true);return;}picked.push(name);this.ping();if(picked.length===5)this.finish('五条路线共同指向不存在的第六频道');else draw();});$('#evidence-reset',this.body)?.addEventListener('click',()=>{picked=[];draw();});};draw();
    }

    render_finalsend(){
      const rounds=[[2,4,1],[3,5,2,4],[2,1,5,3,4]];let round=0,inputIndex=0,accepting=false;
      const flash=()=>{accepting=false;inputIndex=0;const surface=$('.mg-sequence',this.body);if(!surface)return;surface.dataset.ready='false';this.feedback('观察回传脉冲');const delay=this.context?.reducedMotion?90:260;let i=0;const pulse=()=>{if(i>=rounds[round].length){accepting=true;surface.dataset.ready='true';this.feedback('按刚才的顺序复现频道');return;}const button=$(`[data-send="${rounds[round][i]}"]`,surface);button?.classList.add('lit');this.ping();this.later(()=>{button?.classList.remove('lit');i++;this.later(pulse,Math.max(55,delay*.45));},delay);};this.later(pulse,180);};
      const draw=()=>{this.setProgress(`BURST ${round+1} / 03`);this.body.innerHTML=`<div class="mg-intro"><small>CHANNEL 06 · COLLAPSING</small><h3>观察脉冲，然后让五道回响按原路返回</h3><p>每轮序列都会更长。错误输入会让当前回传重新同步。</p></div><div class="mg-sequence" data-ready="false">${[1,2,3,4,5].map(n=>`<button data-send="${n}">CH 0${n}</button>`).join('')}</div><div class="mg-hint">第 ${round+1} 轮 · ${rounds[round].length} 道脉冲。先观察灯光，提示变为“复现频道”后再操作。</div><button class="mg-action" id="sequence-replay">重新播放本轮序列</button>`;
        $$('[data-send]',this.body).forEach(btn=>btn.onclick=()=>{if(!accepting)return;const value=+btn.dataset.send;if(value!==rounds[round][inputIndex]){accepting=false;$('.mg-sequence',this.body).dataset.ready='false';this.ping('wrong');this.feedback('回传顺序崩溃，当前脉冲正在重放',true);this.later(flash,520);return;}btn.classList.add('done');inputIndex++;this.ping();if(inputIndex===rounds[round].length){accepting=false;$('.mg-sequence',this.body).dataset.ready='false';if(round===rounds.length-1){this.later(()=>this.renderFinalIdentity(),320);}else{round++;this.feedback('回传稳定，下一轮加速');this.later(draw,520);}}});
        $('#sequence-replay',this.body).onclick=()=>{if(!accepting)return;flash();};flash();
      };draw();
    }
    renderFinalIdentity(){this.setProgress('IDENTITY');this.body.innerHTML=`<div class="mg-intro"><small>FIVE RETURNS · ONE OPERATOR</small><h3>五道回响已经返回，系统却拒绝承认操作者</h3><p>纪遥的记录残留：操作员姓江；耳机里有人完整叫出了他的名字。</p></div><section class="mg-card" style="max-width:700px;margin:auto"><div class="mg-readout">操作员：江＿</div><div class="mg-input-row"><input id="operator-name" autocomplete="off" placeholder="请输入当前终端操作员的真实姓名"><button class="mg-submit" id="operator-submit">确认身份</button></div></section>`;this.bindText($('#operator-name',this.body),$('#operator-submit',this.body),['江临'],['耳机回放：“江临，看着我。”','操作员记录：江＿。完整姓名是江临'],()=>this.renderFinalMessage());}
    renderFinalMessage(){this.setProgress('FINAL WORD');this.body.innerHTML=`<div class="mg-intro"><small>IDENTITY ACCEPTED · JIANG LIN</small><h3>零点之后，你希望留下些什么？</h3><p>这句话没有标准答案，也不会影响结局。它只保存在当前浏览器的终夜档案中。</p></div><section class="mg-card" style="max-width:700px;margin:auto"><div class="mg-input-row"><input id="final-message" maxlength="40" placeholder="可以留空"><button class="mg-submit" id="message-submit">写入广播</button></div><button class="mg-action" id="message-skip">不留下文字，直接发送</button></section>`;const finish=()=>this.finish('身份确认：江临。最终发送已经抵达零点之后',{message:$('#final-message',this.body)?.value.trim().slice(0,40)||''});$('#message-submit',this.body).onclick=finish;$('#message-skip',this.body).onclick=()=>this.finish('身份确认：江临。最终发送已经抵达零点之后',{message:''});$('#final-message',this.body).addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.isComposing)finish();});this.later(()=>$('#final-message',this.body)?.focus(),60);}
  }

  window.AfterZeroMinigames=AfterZeroMinigames;
})();
