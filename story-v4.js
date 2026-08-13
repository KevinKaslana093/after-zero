(function () {
  'use strict';

  const story = window.AFTER_ZERO_STORY;
  if (!story) throw new Error('AFTER ZERO base story is required before story-v4.js');

  const { nodes, backgrounds, characters } = story;
  const chapter = (no, title) => ({ no, title });
  const addChain = (prefix, meta, bg, entries, next) => {
    entries.forEach((entry, index) => {
      const id = `${prefix}_${String(index + 1).padStart(2, '0')}`;
      const following = index === entries.length - 1 ? next : `${prefix}_${String(index + 2).padStart(2, '0')}`;
      const data = Array.isArray(entry) ? { speaker: entry[0], text: entry[1], char: entry[2] } : entry;
      nodes[id] = { type: 'line', chapter: meta, bg, next: following, ...data };
    });
  };

  Object.assign(backgrounds, {
    v4_rooftop_sunset: { src: 'assets/bg-rooftop-v4-sunset.webp', name: 'FM 00:13 · 黄昏天台' },
    v4_rooftop_signal: { src: 'assets/bg-rooftop-v4-night-signal.webp', name: 'FM 00:13 · 异常天台' },
    v4_studio_day: { src: 'assets/bg-studio-v4-day.webp', name: 'FM 00:13 · 直播间' },
    v4_studio_dusk: { src: 'assets/bg-studio-v4-dusk.webp', name: 'FM 00:13 · 傍晚直播间' },
    v4_studio_signal: { src: 'assets/bg-studio-v4-signal-v2.webp', name: 'FM 00:13 · 异常信号接入' },
    v4_studio_alert: { src: 'assets/bg-studio-v4-alert.webp', name: 'FM 00:13 · 全城警报' },
    v4_studio_missing: { src: 'assets/bg-studio-v4-jianglin-missing.webp', name: 'FM 00:13 · 无人应答' },
    v4_convenience: { src: 'assets/bg-convenience-v4-night.webp', name: '长汀路 · 24小时便利店' },
    v4_lounge_day: { src: 'assets/bg-lounge-v4-day.webp', name: 'FM 00:13 · 休息室' },
    v4_lounge_late: { src: 'assets/bg-lounge-v4-latenight.webp', name: 'FM 00:13 · 深夜休息室' },
    v4_lounge_morning: { src: 'assets/bg-lounge-v4-morning.webp', name: 'FM 00:13 · 清晨休息室' },
    v4_lobby_day: { src: 'assets/bg-station-lobby-v4-day.webp', name: '临海广播中心 · 一层大厅' },
    v4_lobby_all: { src: 'assets/bg-station-lobby-v4-all-here.webp', name: '临海广播中心 · 全员到齐' },
    v4_relay_exterior: { src: 'assets/bg-relay-zero-exterior-v4.webp', name: '临海外环 · 废弃零号中继站' },
    v4_relay_corridor: { src: 'assets/bg-relay-corridor-v4.webp', name: '零号中继站 · 地下走廊' },
    v4_relay_core: { src: 'assets/bg-relay-zero-v4.webp', name: '零号中继站 · 主控室' },
    v4_cg_city_signal: { src: 'assets/cg-city-signal-v4.webp', name: '临海市 · 全域异常广播' },
    v4_cg_city_recovery: { src: 'assets/cg-city-recovery-v4.webp', name: '临海市 · 信号恢复' },
    v4_cg_six_rest: { src: 'assets/cg-six-rest-v4.webp', name: 'FM 00:13 · 六个人的短暂休息' },
    v4_cg_seven_channels: { src: 'assets/cg-relay-seven-channels-v4.webp', name: '零号中继站 · 七路频道' },
    v4_cg_five_deleted: { src: 'assets/cg-five-after-deletion-v4-v3.webp', name: 'FM 00:13 · 江临被删除以后' }
  });

  Object.assign(characters.lincheng.expressions, {
    neutral: 'assets/char-lincheng-v4-neutral.webp', serious: 'assets/char-lincheng-v4-serious.webp',
    warm: 'assets/char-lincheng-v4-warm.webp', startled: 'assets/char-lincheng-surprised-v1.webp',
    tired: 'assets/char-lincheng-v4-tired.webp', resolute: 'assets/char-lincheng-v4-resolute.webp', crying: 'assets/char-lincheng-v4-crying.webp'
  });
  Object.assign(characters.tangsha.expressions, {
    cheerful: 'assets/char-tangsha-v4-cheerful.webp', proud: 'assets/char-tangsha-v4-proud.webp',
    focused: 'assets/char-tangsha-v4-focused.webp', shaken: 'assets/char-tangsha-v4-shaken.webp',
    afraid: 'assets/char-tangsha-v4-afraid.webp', sad: 'assets/char-tangsha-v4-sad.webp', free: 'assets/char-tangsha-v4-free.webp'
  });
  Object.assign(characters.sumi.expressions, {
    neutral: 'assets/char-sumi-v4-neutral.webp', focused: 'assets/char-sumi-v4-focused.webp',
    puzzled: 'assets/char-sumi-v4-puzzled.webp', assertive: 'assets/char-sumi-v4-assertive.webp',
    hurt: 'assets/char-sumi-v4-hurt.webp', sad: 'assets/char-sumi-v4-sad.webp', smile: 'assets/char-sumi-v4-smile.webp'
  });
  Object.assign(characters.guwanqing.expressions, {
    professional: 'assets/char-guwanqing-v4-professional.webp', warm: 'assets/char-guwanqing-v4-warm.webp',
    teasing: 'assets/char-guwanqing-v4-teasing.webp', worried: 'assets/char-guwanqing-v4-worried.webp',
    strained: 'assets/char-guwanqing-v4-strained.webp', breaking: 'assets/char-guwanqing-v4-breaking.webp', accepting: 'assets/char-guwanqing-v4-accepting.webp'
  });
  Object.assign(characters.jiyao.expressions, { thoughtful: 'assets/char-jiyao-v4-thoughtful.webp' });

  const d1 = chapter('D1', '第一天 · 第七道倒影');
  const d2 = chapter('D2', '第二天 · 有人一直守在那里');
  const d3 = chapter('D3', '第三天 · 错误开始有名字');
  const d4 = chapter('D4', '第四天 · 第七条声纹');
  const d5 = chapter('D5', '第五天 · 所有人都在');

  addChain('v4_d1_arrival', d1, 'v4_rooftop_sunset', [
    { speaker: '旁白', char: null, location: true, text: '八年前的00:13，哥哥给我打来最后一通电话。那天我们刚吵完架，我看着屏幕亮到熄灭，没有接。' },
    ['哥哥的录音', '“江临，如果你听见这段话——”', null],
    ['旁白', '录音在这里断掉。八年后，损坏文件忽然自行修复，并附上临海广播中心的招聘邮件。', null],
    ['旁白', '黄昏的天台上，旧天线像一根扎进云层的针。我来这里不是因为愿意为哥哥付出一切，只是不想让那通没有接起的电话替我决定余生。', null],
    ['林澄', '“江临？”', 'lincheng'],
    ['旁白', '她站在设备间门口，手里夹着两张台本，神情安静得像已经等了很久。', 'lincheng'],
    ['林澄', '“我是林澄，《零点之后》的主持人。你的简历在垃圾邮件里躺了十一天。”', 'lincheng'],
    ['我', '“所以你把我叫来，是因为缺制作人？”', 'lincheng'],
    ['林澄', '“也因为你修复了那段本来不该被修复的录音。”', 'lincheng'],
    ['旁白', '她没有解释，先替我推开门。天线红灯在身后亮起，时间还没到零点。', null]
  ], 'v4_d1_meet_01');

  addChain('v4_d1_meet', d1, 'v4_studio_day', [
    { speaker: '旁白', char: null, location: true, text: '直播间里，五只杯子占据了调音台边缘，空出来的位置正好够放下我的那只。' },
    ['唐砂', '“新制作人！先别动，我要拍一张你还没后悔入职的照片。”', 'tangsha'],
    ['唐砂', '“唐砂，街头摄影师，节目外勤，以及这里唯一会主动制造气氛的人。”', 'tangsha'],
    ['苏弥', '“她还负责制造设备维修单。”', 'sumi'],
    ['苏弥', '“苏弥，声音工程。线不要乱拔，咖啡不要放在推子右边。”', 'sumi'],
    ['顾晚晴', '“顾晚晴，急诊科。她真正想说的是欢迎。”', 'guwanqing'],
    ['顾晚晴', '“你脸色不好。晚饭吃了吗？”', 'guwanqing'],
    ['我', '“这算入职体检？”', 'guwanqing'],
    ['顾晚晴', '“算免费提醒。硬撑不会让人显得更可靠。”', 'guwanqing'],
    ['纪遥', '“纪遥，都市民俗研究。我的工作是证明她们遇到的怪事，不全是设备故障或低血糖。”', 'jiyao'],
    ['林澄', '“先别吓他。今晚只做普通直播。”', 'lincheng'],
    ['唐砂', '“她每次说‘普通’，最后都不普通。”', 'tangsha'],
    ['旁白', '她们争论宵夜吃什么，苏弥把我的工位权限改成“第六席”，顾晚晴顺手将止痛片放进公共抽屉。那些琐碎动作比欢迎词更像欢迎。', null]
  ], 'v4_d1_howl_01');

  addChain('v4_d1_howl', d1, 'v4_studio_signal', [
    ['音效', '——嗡！', null],
    ['旁白', '试音刚开始，返听里突然爆出尖锐啸叫。整排电平表撞到红区，调音台却找不到任何输入源。', null],
    ['苏弥', '“主输出归零，啸叫还在。不是室内回授。”', 'sumi'],
    ['林澄', '“所有人摘耳机。”', 'lincheng'],
    ['陌生男声', '“关闭三号辅助发送。延迟补偿改成负十三毫秒。”', null],
    ['我', '“谁在说话？”', null],
    ['陌生男声', '“旧中继站，零号。先解决声音，再问身份。”', null],
    ['苏弥', '“三号辅助根本没有接线。”', 'sumi'],
    ['零号', '“所以系统才看不见它。江临，左手第二排，橙色旋钮。”', null],
    ['旁白', '我照做。啸叫像被刀切断，窗玻璃上的震纹也同时停止。', null],
    ['唐砂', '“他怎么知道你的名字？”', 'tangsha'],
    ['零号', '“接入记录里写着。今晚不要停播，异常会沿着空频道寻找下一台接收器。”', null],
    ['林澄', '“你为什么帮我们？”', 'lincheng'],
    ['零号', '“因为八年前没人接起的时候，我就在这里。”', null],
    ['旁白', '线路随即断开。苏弥保存波形，文件署名却不是零号，而是一串时间：00:13。', null]
  ], 'v4_d1_first_choice');

  nodes.v4_d1_first_choice = {
    type: 'choice', chapter: d1, bg: 'v4_studio_day', prompt: '距离开播还有十分钟，你先去帮谁？',
    choices: [
      { label: '陪林澄重新核对开场台本', hint: '她的手仍压在静音键上', next: 'v4_d1_broadcast_01', effect: { affinity: { lincheng: 2 }, flags: { routeBias: 'lincheng' } } },
      { label: '和苏弥封存异常波形', hint: '技术证据可能再次消失', next: 'v4_d1_broadcast_01', effect: { affinity: { sumi: 2 }, flags: { routeBias: 'sumi' } } },
      { label: '帮唐砂检查刚才拍下的照片', hint: '取景框里似乎多了什么', next: 'v4_d1_broadcast_01', effect: { affinity: { tangsha: 2 }, flags: { routeBias: 'tangsha' } } }
    ]
  };

  addChain('v4_d1_broadcast', d1, 'v4_studio_dusk', [
    ['旁白', '00:00，片头音乐亮起。林澄推起推子，方才的慌乱被她留在红灯之外。', null],
    ['林澄', '“这里是FM 00:13。无论你正在回家、失眠，还是等待一个不会回来的人——今晚，我们陪你。”', 'lincheng'],
    ['旁白', '第一位听众抱怨楼上每天半夜拖椅子，唐砂憋笑，纪遥认真记录“重复性居家怪谈”。', null],
    ['旁白', '第二位听众说不敢向女儿道歉。顾晚晴让他先把“对不起”写下来，苏弥悄悄把背景音乐调低。', null],
    ['我', '“还有四十秒进广告。”', 'lincheng'],
    ['林澄', '“收到。第一次配合得不错。”', 'lincheng'],
    ['旁白', '普通人的失眠、难堪和想念从耳机里依次经过。它们没有拯救城市，却让这个凌晨第一次像一个值得留下来的地方。', null],
    ['旁白', '节目结束时，墙钟平稳越过00:13。所有人同时松了口气，又假装没有。', null]
  ], 'v4_d1_supper_01');

  addChain('v4_d1_supper', d1, 'v4_convenience', [
    { speaker: '旁白', char: null, location: true, text: '凌晨一点，六个人挤在便利店窗边。唐砂坚持新同事第一天必须吃一顿“活着下播宴”。' },
    ['唐砂', '“规则一：最后一串鱼丸归摄影师。”', 'tangsha'],
    ['苏弥', '“这是你刚刚发明的。”', 'sumi'],
    ['顾晚晴', '“江临，别只喝咖啡。选一样有温度的。”', 'guwanqing'],
    ['纪遥', '“我建议关东煮。热汤可以降低撞见无脸倒影的概率。”', 'jiyao'],
    ['我', '“后半句有研究依据吗？”', 'jiyao'],
    ['纪遥', '“没有，但你开始接我的话了。团队融入进度良好。”', 'jiyao'],
    ['林澄', '“别欺负新人。”', 'lincheng'],
    ['唐砂', '“那就合照。江临，站中间，证明我们今天确实有六个人。”', 'tangsha'],
    ['旁白', '快门落下。照片里是江临和五位女生，正好六个人。可便利店玻璃的倒影里，还站着第七个没有脸的人。', null],
    ['苏弥', '“不是反射角度。它没有对应实体。”', 'sumi'],
    ['零号', '“删除照片。现在。”', null],
    ['唐砂', '“你一直在监听我们？”', 'tangsha'],
    ['零号', '“那不是人，是被错误频道记住的位置。保留照片，它就会学会你们的脸。”', null],
    ['我', '“给我们一个相信你的理由。”', null],
    ['零号', '“因为它先学会的，会是按下快门的人。”', null],
    ['旁白', '唐砂脸上的笑消失了。她按下删除。相机显示“已删除”，玻璃里的第七道倒影却抬起了头。', null]
  ], 'v4_d2_morning_01');

  addChain('v4_d2_morning', d2, 'v4_lounge_morning', [
    { speaker: '旁白', char: null, location: true, text: '第二天早上，我被豆浆的热气和苏弥拆键盘的声音叫醒。昨夜谁也没回家。' },
    ['顾晚晴', '“醒了？先吃东西，再讨论世界末日。”', 'guwanqing'],
    ['唐砂', '“纠正，是局部世界末日。我的存储卡里所有照片都在，只有那张合照消失了。”', 'tangsha'],
    ['苏弥', '“服务器备份也没有。删除发生在照片拍摄之前三秒。”', 'sumi'],
    ['纪遥', '“也就是说，我们删除了一张尚未存在的照片。很有礼貌的因果关系。”', 'jiyao'],
    ['林澄', '“零号没有再上线？”', 'lincheng'],
    ['我', '“没有。但他知道我们的位置、设备，也知道唐砂会先出事。”', null],
    ['旁白', '桌上摊着六份早餐。没人承认第七杯无糖咖啡是谁放的。', null],
    ['唐砂', '“先说好，今天不准再拿‘保护我’当理由删原片。”', 'tangsha'],
    ['顾晚晴', '“那你也不准一个人去找倒影。”', 'guwanqing'],
    ['唐砂', '“成交。江临作证。”', 'tangsha'],
    ['旁白', '这句随口的“作证”让我第一次意识到，她们已经默认我属于这个房间。', null]
  ], 'v4_d2_help_choice');

  nodes.v4_d2_help_choice = {
    type: 'choice', chapter: d2, bg: 'v4_lounge_day', prompt: '上午没有异常，你把空出来的时间留给——',
    choices: [
      { label: '陪顾晚晴整理热线回访', hint: '她记得每个没有再次来电的人', next: 'v4_d2_daily_01', effect: { affinity: { guwanqing: 2 }, flags: { routeBias: 'guwanqing' } } },
      { label: '帮纪遥给旧磁带重新编号', hint: '其中一盘写着你的听众署名', next: 'v4_d2_daily_01', effect: { affinity: { jiyao: 2 }, flags: { routeBias: 'jiyao' } } },
      { label: '留下来替大家做午饭', hint: '普通的一顿饭也是证据', next: 'v4_d2_daily_01', effect: { affinity: { lincheng: 1, tangsha: 1, sumi: 1, guwanqing: 1, jiyao: 1 } } }
    ]
  };

  addChain('v4_d2_daily', d2, 'v4_lounge_day', [
    ['旁白', '中午，唐砂嫌我切的土豆大小不一，最后却把最焦的一块夹进自己碗里。', null],
    ['苏弥', '“昨晚到现在，异常信号每十三分钟扫过一次城市。没有造成实际伤害。”', 'sumi'],
    ['纪遥', '“像有人沿着门牌确认住户。”', 'jiyao'],
    ['林澄', '“或者在确认我们还在不在。”', 'lincheng'],
    ['顾晚晴', '“今晚热线照常。不能因为我们害怕，就让真正需要回答的人听见空台。”', 'guwanqing'],
    ['旁白', '这不是英雄宣言。她说完就低头洗杯子，袖口被水溅湿了一小块。正因为普通，才让人愿意相信。', null]
  ], 'v4_d2_call_01');

  addChain('v4_d2_call', d2, 'v4_studio_signal', [
    ['旁白', '22:41，一位独居老人打进节目，说楼道广播一直叫他去地下车库。', null],
    ['听众', '“它用我老伴的声音，说她在下面等我。”', null],
    ['林澄', '“不要下楼。保持通话，我们会陪着您。”', 'lincheng'],
    ['苏弥', '“定位到了。海棠苑，地下车库燃气报警器失效。”', 'sumi'],
    ['顾晚晴', '“我联系急救和消防。”', 'guwanqing'],
    ['零号', '“消防会晚七分钟。打开小区旧广播的维护频道，我可以远程启动排风。”', null],
    ['我', '“代价是什么？”', null],
    ['零号', '“现在问代价，他就会死。”', null],
    ['旁白', '苏弥看向我。屏幕上，燃气浓度还在上升。', null]
  ], 'v4_d2_zero_choice');

  nodes.v4_d2_zero_choice = {
    type: 'choice', chapter: d2, bg: 'v4_studio_signal', prompt: '零号要求临时接管旧广播维护频道——',
    choices: [
      { label: '开放频道，同时保留完整操作日志', hint: '救人，但不交出判断权', next: 'v4_d2_rescue_01', effect: { affinity: { sumi: 1, guwanqing: 1 }, flags: { trustedZeroConditionally: true } } },
      { label: '让林澄继续拖住听众，自己手动执行', hint: '风险更高，但频道仍属于我们', next: 'v4_d2_rescue_01', effect: { affinity: { lincheng: 1, guwanqing: 1 }, flags: { resistedZero: true } } }
    ]
  };

  addChain('v4_d2_rescue', d2, 'v4_cg_city_recovery', [
    ['旁白', '排风机在极限前启动。老人被赶来的消防员带出楼道，电话那头终于传来真实的人声。', null],
    ['听众', '“姑娘，谢谢你们。刚才一直有人陪我说话，我就没那么怕了。”', null],
    ['林澄', '“不是一个人。今晚有很多人在听。”', 'lincheng'],
    ['零号', '“一次错误已经修正。”', null],
    ['我', '“你刚才说代价。”', null],
    ['零号', '“每次修正都会把压力推向别的节点。区别只在于，你们是否来得及看见。”', null],
    ['唐砂', '“别把救人说成做错事。”', 'tangsha'],
    ['零号', '“我没有。只是提醒你们，救下一个结局，不等于世界愿意免费接受它。”', null],
    ['旁白', '零号离线后，旧录音机自行转动。哥哥八年前未说完的后半句从磁带里挤了出来。', null],
    ['哥哥的录音', '“……不要相信那个声音。”', null],
    ['旁白', '房间里没有人说话。墙钟走过00:13，像一只眼睛眨了一下。', null]
  ], 'v4_d3_open_01');

  addChain('v4_d3_open', d3, 'v4_lobby_day', [
    { speaker: '旁白', char: null, location: true, text: '第三天，广播中心大厅的来访登记多了一行：第八位听众，00:13。保安坚称昨晚没有第八个人进门。' },
    ['纪遥', '“字迹不是江临，也不是我们任何一个人。”', 'jiyao'],
    ['苏弥', '“门禁记录却用了江临的权限。”', 'sumi'],
    ['我', '“也许有人复制了卡。”', null],
    ['林澄', '“或者有人不需要真的进门，只需要我们替他作出选择。”', 'lincheng'],
    ['唐砂', '“你们看登记备注：‘昨天的老人已经安全’。这句话只有直播间的人知道。”', 'tangsha'],
    ['顾晚晴', '“先把它当成提醒，不要急着把屏幕外的东西请进来。”', 'guwanqing'],
    ['旁白', '我抬头看大厅监控。画面里六个人站成一排，第七个位置空着；字幕却显示“检测到七人”。', null]
  ], 'v4_d3_studio_01');

  addChain('v4_d3_studio', d3, 'v4_studio_dusk', [
    ['旁白', '下午，大家试着像平常一样工作。林澄录公益片，唐砂趴在地上挑镜头，苏弥用胶带给每根线重新贴标签。', null],
    ['顾晚晴', '“江临，把手给我。”', 'guwanqing'],
    ['我', '“我没受伤。”', 'guwanqing'],
    ['顾晚晴', '“你从早上开始心率就没降下来。把脉的时候别端水，先坐好。”', 'guwanqing'],
    ['旁白', '我把杯子放下。她确认脉搏后才松开手，顺便把那杯温水推回来。', 'guwanqing'],
    ['唐砂', '“顾医生，区别对待啊。我紧张的时候你只让我少喝咖啡。”', 'tangsha'],
    ['顾晚晴', '“因为你不听。”', 'guwanqing'],
    ['苏弥', '“安静。城市应急频段出现叠波。”', 'sumi'],
    ['旁白', '屏幕上，五条波形从不同方向同时逼近临海市中心。每一条都携带一份不同的伤亡名单。', null]
  ], 'v4_d3_alarm_01');

  addChain('v4_d3_alarm', d3, 'v4_cg_city_signal', [
    ['零号', '“不要逐条处理。五份名单是同一场事故的五种结果。”', null],
    ['林澄', '“事故地点？”', 'lincheng'],
    ['零号', '“全城广播塔。十三分钟后，异常信号会让所有仍在播出的接收器产生次声共振。”', null],
    ['顾晚晴', '“影响范围？”', 'guwanqing'],
    ['零号', '“先是眩晕，然后失控。交通、医院、学校，一个都不会例外。”', null],
    ['苏弥', '“我们可以反相抵消，但缺少中心频率。”', 'sumi'],
    ['纪遥', '“五份名单里反复出现的名字，也许就是锚点。”', 'jiyao'],
    ['唐砂', '“找到了。每一份最后一行都是江临。”', 'tangsha'],
    ['我', '“拿我的声纹做反相样本。”', null],
    ['林澄', '“不行。零号，说明风险。”', 'lincheng'],
    ['零号', '“他可能短暂失去部分记忆，也可能被系统当成噪声删除。”', null],
    ['我', '“还有别的方案吗？”', null],
    ['零号', '“有。什么都不做，然后从五份名单里挑一份接受。”', null]
  ], 'v4_d3_decision');

  nodes.v4_d3_decision = {
    type: 'choice', chapter: d3, bg: 'v4_studio_alert', prompt: '反相广播需要另一道与江临同步的信号。你请求谁留在主控？',
    choices: [
      { label: '林澄：用直播声场保持江临清醒', hint: '声音必须持续抵达', next: 'v4_d3_save_01', effect: { affinity: { lincheng: 2 }, flags: { routeBias: 'lincheng' } } },
      { label: '苏弥：实时修正反相波形', hint: '把不可控压缩成可以计算的问题', next: 'v4_d3_save_01', effect: { affinity: { sumi: 2 }, flags: { routeBias: 'sumi' } } },
      { label: '顾晚晴：监测身体与认知状态', hint: '先确保救人的人也能回来', next: 'v4_d3_save_01', effect: { affinity: { guwanqing: 2 }, flags: { routeBias: 'guwanqing' } } }
    ]
  };

  addChain('v4_d3_save', d3, 'v4_studio_alert', [
    ['旁白', '倒计时归零。低沉脉冲穿过墙体，桌面上的水杯同时跳了一下。', null],
    ['音效', '咚——咚——咚——', null],
    ['旁白', '我把声纹送进主频道。画面剧烈晃动，耳机里像有整座城市的心跳压向颅骨。', null],
    ['林澄', '“江临，看着我。说出今天早上吃了什么。”', 'lincheng'],
    ['我', '“豆浆……还有被唐砂抢走一半的烧麦。”', null],
    ['唐砂', '“是你主动给我的！别趁失忆篡改历史！”', 'tangsha'],
    ['苏弥', '“反相锁定。百分之七十……九十……”', 'sumi'],
    ['顾晚晴', '“心率太高，再给他十秒。”', 'guwanqing'],
    ['纪遥', '“登记表上的第八位听众正在回传同步信号。”', 'jiyao'],
    ['我', '“谁？”', null],
    ['纪遥', '“不知道。但他写了一句话：‘别让江临在这里结束。’”', 'jiyao'],
    ['旁白', '最后一道杂波被抵消。全城的灯暗了一瞬，又依次亮起。', null]
  ], 'v4_d3_after_01');

  addChain('v4_d3_after', d3, 'v4_cg_city_recovery', [
    ['旁白', '没有车辆失控，没有急诊爆满，五份伤亡名单同时清空。我们真正救下了这座城市一次。', null],
    ['唐砂', '“成功了。江临，你还记得我欠你几个烧麦吗？”', 'tangsha'],
    ['我', '“你刚刚不是说只抢了一半？”', 'tangsha'],
    ['唐砂', '“记忆正常。”', 'tangsha'],
    ['零号', '“城市记住了被救下的结果，却不会忘记是谁替它承担噪声。”', null],
    ['我', '“你早就知道名单里会有我。”', null],
    ['零号', '“从你第一次没有接起那通电话开始，你就是所有结果的交点。”', null],
    ['林澄', '“你认识江临的哥哥。”', 'lincheng'],
    ['零号', '“去旧中继站。答案在那里。明晚之前。”', null],
    ['旁白', '线路关闭。屏幕上留下一个从未出现在城市地图里的坐标。', null]
  ], 'v4_d4_depart_01');

  addChain('v4_d4_depart', d4, 'v4_lobby_all', [
    { speaker: '旁白', char: null, location: true, text: '第四天傍晚，六个人在大厅集合。没人讨论谁应该留下，因为每个人都带好了要去的东西。' },
    ['顾晚晴', '“急救包、止血带、两份葡萄糖。江临，这次不是只提醒你。”', 'guwanqing'],
    ['苏弥', '“离线终端、模拟接收器、机械断线钳。中继站如果试图上传数据，我会直接切物理线路。”', 'sumi'],
    ['唐砂', '“两台相机。一台记录我们看见的，一台记录我们没看见的。”', 'tangsha'],
    ['纪遥', '“八年前的逆时广播目录，还有那盘写着你名字的空磁带。”', 'jiyao'],
    ['林澄', '“我带了移动发射机。无论里面发生什么，至少要有人听见。”', 'lincheng'],
    ['我', '“听起来没人打算听我的撤离安排。”', null],
    ['唐砂', '“你第三天才入职，现在想当领导，晚了。”', 'tangsha'],
    ['旁白', '她说完把备用电池塞给我。那是她表达“别死”的方式。', null]
  ], 'v4_d4_exterior_01');

  addChain('v4_d4_exterior', d4, 'v4_relay_exterior', [
    { speaker: '旁白', char: null, location: true, text: '零号中继站藏在临海外环废弃隧道后。铁门锈死，门牌只剩一个被划掉又重新刻上的0。' },
    ['零号', '“你们迟到了三分钟。”', null],
    ['唐砂', '“你既然一直守在这里，开门。”', 'tangsha'],
    ['零号', '“我只能操作仍被系统承认的设备。门已经从维护表中删除。”', null],
    ['苏弥', '“那就说明它现在属于撬棍。”', 'sumi'],
    ['旁白', '苏弥和我一起压下撬杆。锁舌断开的瞬间，隧道深处亮起七盏灯。', null],
    ['纪遥', '“我们六个人。为什么有七盏？”', 'jiyao'],
    ['零号', '“因为还有一位从来不在你们的世界里。”', null],
    ['我', '“第八个听众？”', null],
    ['零号', '“不。你们是六个人，我是零号。屏幕外那位，才是第八个。”', null]
  ], 'v4_d4_corridor_01');

  addChain('v4_d4_corridor', d4, 'v4_relay_corridor', [
    ['旁白', '地下走廊每隔十三米就有一道门。门后的录音都来自不同日期，却重复同一句开场白。', null],
    ['录音中的林澄', '“这里是FM 00:13。今晚，我们陪你。”', null],
    ['唐砂', '“这是我的声音……可我不记得来过。”', 'tangsha'],
    ['苏弥', '“录音共有五组。每组里，我们的身份和结局都不同。”', 'sumi'],
    ['顾晚晴', '“有一组我死在急诊，有一组唐砂没有走出雨夜。”', 'guwanqing'],
    ['纪遥', '“它保存的不是预测，是已经被覆盖的人生。”', 'jiyao'],
    ['林澄', '“零号，你一直在收集这些？”', 'lincheng'],
    ['零号', '“我在防止它们互相吞噬。每救下一条，另一条就会从现实退到这里。”', null],
    ['我', '“所以你说修正有代价。”', null],
    ['零号', '“我说的是事实，不是劝你们停止。”', null],
    ['旁白', '走廊尽头出现一扇没有把手的门。终端要求输入“观察者回答”。', null],
    ['纪遥', '“它不是在等江临。输入框里的光标，在跟随屏幕外的点击。”', 'jiyao']
  ], 'v4_d4_observer_choice');

  nodes.v4_d4_observer_choice = {
    type: 'choice', chapter: d4, bg: 'v4_relay_corridor', prompt: '终端向屏幕前的第八位听众提问：你为什么仍在继续？',
    choices: [
      { label: '因为已经记住了她们', hint: '记忆让被覆盖的人生仍有重量', next: 'v4_d4_core_01', effect: { affinity: { jiyao: 2 }, flags: { routeBias: 'jiyao', playerMemory: true } } },
      { label: '因为不接受唯一正确的结局', hint: '选择不该由系统替任何人结束', next: 'v4_d4_core_01', effect: { affinity: { tangsha: 2 }, flags: { routeBias: 'tangsha', playerFreedom: true } } },
      { label: '因为有人还在等待回答', hint: '陪伴本身就是抵抗', next: 'v4_d4_core_01', effect: { affinity: { lincheng: 1, guwanqing: 1 }, flags: { playerCare: true } } }
    ]
  };

  addChain('v4_d4_core', d4, 'v4_cg_seven_channels', [
    { speaker: '旁白', char: null, location: true, text: '门后，七路频道围成半圆。前五路播放五种未来，第六路是此刻，第七路只有一道来自屏幕外的输入光标。' },
    ['苏弥', '“七路都在向同一个核心写入。核心识别名——江临。”', 'sumi'],
    ['顾晚晴', '“为什么是他？”', 'guwanqing'],
    ['零号', '“因为五种未来里，唯一每次都存在、又每次作出不同选择的人是他。”', null],
    ['林澄', '“不对。真正作出不同选择的是屏幕外的人。”', 'lincheng'],
    ['纪遥', '“江临是载体。第八位听众才是让分歧发生的观察者。”', 'jiyao'],
    ['我', '“如果切断核心？”', null],
    ['零号', '“五条未来会同时失控。明晚00:13，它们将争夺唯一现实。”', null],
    ['唐砂', '“那就让它们别争。我们把所有人都带回来。”', 'tangsha'],
    ['零号', '“你们总把愿望说得像方案。”', null],
    ['苏弥', '“方案由我来写。你只需要把你知道的全部交出来。”', 'sumi'],
    ['旁白', '零号沉默很久，最终开放了核心日志。最后一页只有一句：当五条结果同时被保留，删除共同变量。', null],
    ['林澄', '“共同变量是江临。”', 'lincheng'],
    ['零号', '“明晚以前，我会找到别的办法。”', null],
    ['旁白', '他说得太平静，像一个已经替所有人做完决定的人。', null]
  ], 'v4_d5_rest_01');

  addChain('v4_d5_rest', d5, 'v4_cg_six_rest', [
    { speaker: '旁白', char: null, location: true, text: '第五天清晨，六个人回到直播间。没人睡够，也没人离开。桌上正好六只杯子，江临没有端着水让人把脉。' },
    ['唐砂', '“先宣布，今天谁敢说‘你们走，我留下’，我就用三脚架打断他的英雄发言。”', 'tangsha'],
    ['顾晚晴', '“我可以负责接骨，但我支持这个规定。”', 'guwanqing'],
    ['苏弥', '“方案分成五个执行点。任何一个失败，现实都会被对应未来覆盖。”', 'sumi'],
    ['纪遥', '“所以不是选谁去死。是选我们先相信哪一种答案，再把其他答案接回来。”', 'jiyao'],
    ['林澄', '“江临，你不用承诺救下所有人。”', 'lincheng'],
    ['我', '“那我承诺一件更实际的：每次行动前都告诉你们，不擅自消失。”', 'lincheng'],
    ['唐砂', '“勉强及格。”', 'tangsha'],
    ['旁白', '短暂的笑声落在调音台上。正因为知道夜里可能失去一切，这个普通早晨才显得昂贵。', null]
  ], 'v4_d5_prepare_01');

  addChain('v4_d5_prepare', d5, 'v4_studio_day', [
    ['旁白', '白天，我们把五个执行点反复演练。林澄负责直播主声道，唐砂负责城市视觉证据，苏弥负责核心波形。', null],
    ['旁白', '顾晚晴建立急救联络，纪遥用名字和记录固定被覆盖的人。我的任务是保持五路同步，直到00:13以后。', null],
    ['林澄', '“测试。听见我的声音就回答。”', 'lincheng'],
    ['我', '“收到。”', 'lincheng'],
    ['唐砂', '“测试。看镜头。”', 'tangsha'],
    ['我', '“你没开镜头盖。”', 'tangsha'],
    ['唐砂', '“观察力合格。”', 'tangsha'],
    ['苏弥', '“测试。不要动第三路。”', 'sumi'],
    ['我', '“你说这句话通常就是让我动。”', 'sumi'],
    ['顾晚晴', '“测试。头晕、耳鸣、记忆断片，任何一个出现都立刻说。”', 'guwanqing'],
    ['纪遥', '“测试。你叫什么名字？”', 'jiyao'],
    ['我', '“江临。”', 'jiyao'],
    ['纪遥', '“屏幕前那位呢？”', 'jiyao'],
    ['旁白', '终端自动填入了玩家留下的听众署名：{player}。没有人碰键盘。', null]
  ], 'v4_d5_alarm_01');

  addChain('v4_d5_alarm', d5, 'v4_studio_alert', [
    ['旁白', '23:59，警报提前响起。窗外所有建筑的灯同时熄灭，又以五种不同节奏亮起。', null],
    ['音效', '——砰！', null],
    ['旁白', '第一轮冲击让屏幕向左错位，天花板落下灰尘。紧接着是第二声、第三声，像有什么东西在城市外敲门。', null],
    ['苏弥', '“五条未来同时上线。它们在抢占现实频道。”', 'sumi'],
    ['顾晚晴', '“急救中心收到五套互相矛盾的事故坐标。”', 'guwanqing'],
    ['唐砂', '“相机里天已经亮了，可现在明明还是夜里。”', 'tangsha'],
    ['纪遥', '“档案正在删除名字。先从不属于当前世界的人开始。”', 'jiyao'],
    ['林澄', '“主频道还能坚持多久？”', 'lincheng'],
    ['苏弥', '“十三分钟。然后系统会执行‘删除共同变量’。”', 'sumi'],
    ['零号', '“我可以阻止。”', null],
    ['我', '“怎么阻止？”', null],
    ['零号', '“把江临从五条未来全部断开。现在断开，他会活，只是不再参与任何一种结局。”', null],
    ['林澄', '“也就是从我们的记忆和记录里消失。”', 'lincheng'],
    ['零号', '“没有人死亡。这是损失最小的答案。”', null],
    ['我', '“你已经准备执行了，对吗？”', null],
    ['零号', '“我不需要你理解。只需要你们活到明天。”', null],
    ['旁白', '零号切断远程通话，却没有离开系统。他不是来征求同意，而是在等待我们失败。', null]
  ], 'v4_d5_counter_01');

  addChain('v4_d5_counter', d5, 'v4_studio_signal', [
    ['苏弥', '“我锁住删除指令，但只能保留一条外部通道。”', 'sumi'],
    ['林澄', '“那就让{player}留在外面。只要还有人记得，删除就不完整。”', 'lincheng'],
    ['纪遥', '“五种未来各有一个最稳定的情感节点。我们必须先进入其中一个，经历它、失去它，再把回响带回来。”', 'jiyao'],
    ['唐砂', '“说人话。”', 'tangsha'],
    ['纪遥', '“我们不可能第一次就救下所有人。某条线路一定会先走到坏结局。”', 'jiyao'],
    ['顾晚晴', '“但失败会留下信息。下一次，屏幕前的人会看见我们第一次没有的选择。”', 'guwanqing'],
    ['我', '“所以不是五选一。是从其中一条开始，把五条都走完。”', null],
    ['零号', '“你们把死亡叫作尝试？”', null],
    ['我', '“不。我们会记住它。所以它不会只是一次可丢弃的尝试。”', null],
    ['林澄', '“00:13到了。江临，选择第一道要回答的信号。”', 'lincheng'],
    ['旁白', '五个人的频道同时亮起。屏幕外的第八位听众把手放在选择之上。', null]
  ], 'route_select');

  nodes.v4_route_reentry = {
    type: 'choice', chapter: chapter('D5', '重新回答'), bg: 'v4_studio_signal', routeChoice: true,
    prompt: '失败留下了回响。这一次，你要重新接入哪一道信号？',
    choices: [
      { label: '回答林澄的声音', hint: '父爱主义与自主选择', char: 'lincheng', next: 'v2_lock_lincheng_01', effect: { route: 'lincheng', affinity: { lincheng: 3 } } },
      { label: '走进唐砂的取景框', hint: '决定论与自由意志', char: 'tangsha', next: 'v2_lock_tangsha_01', effect: { route: 'tangsha', affinity: { tangsha: 3 } } },
      { label: '进入苏弥的双人频道', hint: '工具理性与人的价值', char: 'sumi', next: 'v2_lock_sumi_01', effect: { route: 'sumi', affinity: { sumi: 3 } } },
      { label: '接过顾晚晴的值班表', hint: '有用与自我价值', char: 'guwanqing', next: 'v2_lock_guwanqing_01', effect: { route: 'guwanqing', affinity: { guwanqing: 3 } } },
      { label: '念出纪遥保管的名字', hint: '叙事身份与记忆', char: 'jiyao', next: 'v2_lock_jiyao_01', effect: { route: 'jiyao', affinity: { jiyao: 3 } } }
    ]
  };

  // 林澄 V4：第一次接入必然失去她。失败记录会解锁四个此前不存在的
  // 回响选项；玩家必须连续把决定权还给当事人，才能拒绝“为了你好”。
  const lc1 = chapter('L1', '替你决定的人');
  const lc2 = chapter('L2', '静音以前');
  const lc0 = chapter('L0', '未关闭的监听');

  if (nodes.v2_lock_lincheng_03) nodes.v2_lock_lincheng_03.next = 'v4_lc_open_01';

  addChain('v4_lc_open', lc1, 'v4_studio_dusk', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '五条未来分开后，其他人的声音退成遥远底噪。直播间只剩林澄和我，以及一通尚未接起的电话。' },
    ['林澄', '“这一条未来里，失控的是主持信号。明晚00:13，听见我声音的人会逐渐忘记自己最想留下的人。”', 'lincheng'],
    ['我', '“包括你自己？”', 'lincheng'],
    ['林澄', '“主持人不需要被听众记住。只要节目还能把他们送回去。”', 'lincheng'],
    ['我', '“你又开始把牺牲说成工作流程。”', 'lincheng'],
    ['林澄', '“因为流程不会犹豫。”', 'lincheng'],
    ['旁白', '她打开八年前的排班表。哥哥失踪那一栏旁边，是她亲手写下的“自愿进入零号中继站”。', 'lincheng'],
    ['林澄', '“他替我回答了最后一通电话。后来我告诉自己：至少其他人活下来了。”', 'lincheng'],
    ['林澄', '“可这句话说久了，就分不清是在纪念他，还是在原谅我自己。”', 'lincheng'],
    ['旁白', '她没有请求宽恕，只把事实推到我面前。与此同时，回放设备里闪过一行像是已经见过的字幕。', null]
  ], 'v4_lc_choice1');

  nodes.v4_lc_choice1 = {
    type: 'choice', chapter: lc1, bg: 'v4_studio_dusk', prompt: '林澄等待你评价八年前的决定——',
    choices: [
      { label: '“你也是为了救人。”', hint: '用结果替她减轻责任', next: 'v4_lc_after1_01' },
      { label: '“如果是我，也可能作出同样选择。”', hint: '把自己的答案覆盖在她身上', next: 'v4_lc_after1_01' },
      { label: '【回响】“我会听完，但原不原谅、怎么记住，都该由我决定。”', hint: '理解不是替对方取消后果', hiddenUntilUnlocked: true, requires: { echoes: 'lincheng' }, next: 'v4_lc_after1_01', effect: { flags: { lcEchoTruth: true } } }
    ]
  };

  addChain('v4_lc_after1', lc1, 'v4_lounge_late', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '凌晨两点，我们把散落的录音搬进休息室。林澄按照日期贴标签，我负责念出文件名。' },
    ['林澄', '“你小时候给电台写过一封投诉信。”', 'lincheng'],
    ['我', '“投诉什么？”', 'lincheng'],
    ['林澄', '“你哥哥值夜班不回家。你要求主持人命令他准时下班。”', 'lincheng'],
    ['我', '“听起来很合理。”', 'lincheng'],
    ['林澄', '“我还真的在天气预报后念了。他第二天拿着那段录音笑了很久。”', 'lincheng'],
    ['旁白', '她说起哥哥时不再只剩愧疚。那个人会赖班、会笑，也会自作主张；他终于从“牺牲者”变回一个真实的人。', null],
    ['林澄', '“明天的直播，你留在观察室。主频道只能承受一个人的声纹。”', 'lincheng'],
    ['我', '“这不是商量。”', 'lincheng'],
    ['林澄', '“是风险控制。”', 'lincheng']
  ], 'v4_lc_choice2');

  nodes.v4_lc_choice2 = {
    type: 'choice', chapter: lc1, bg: 'v4_lounge_late', prompt: '她再次以保护为由把你排除在决定外——',
    choices: [
      { label: '暂时答应，准备明晚偷偷进入直播间', hint: '保留行动，却没有建立共同决定', next: 'v4_lc_morning_01' },
      { label: '直接拒绝：“你拦不住我。”', hint: '用自己的强迫对抗她的强迫', next: 'v4_lc_morning_01' },
      { label: '【回响】“把风险全部告诉我，然后让我自己回答要不要留下。”', hint: '保护可以提供信息，不能代替同意', hiddenUntilUnlocked: true, requires: { echoes: 'lincheng' }, next: 'v4_lc_morning_01', effect: { flags: { lcEchoConsent: true } } }
    ]
  };

  addChain('v4_lc_morning', lc2, 'v4_rooftop_sunset', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '第二天黄昏，林澄在天台测试移动话筒。城市仍然记得她的声音，可录音中的每一次自我介绍都在变轻。' },
    ['我', '“异常已经开始删除你。”', 'lincheng'],
    ['林澄', '“所以更不能让第二道声纹进入主频道。”', 'lincheng'],
    ['我', '“如果你消失，谁来证明这是你选择的，不是系统替你选的？”', 'lincheng'],
    ['林澄', '“结果不会因为有没有人证明而改变。”', 'lincheng'],
    ['我', '“会。被迫牺牲和主动承担不是同一件事。”', 'lincheng'],
    ['旁白', '她看向远处的城市。无数窗户亮起，每一扇后面都可能有人正在等今晚的节目。', 'lincheng'],
    ['林澄', '“主持人有时必须替听众按下静音。有人已经痛到无法判断时，总要有另一个人先阻止他。”', 'lincheng'],
    ['我', '“暂时阻止可以，永久替他决定不行。”', 'lincheng'],
    ['林澄', '“界线在哪里？”', 'lincheng'],
    ['旁白', '第一次，她没有直接给出标准答案。她在问。', null]
  ], 'v4_lc_choice3');

  nodes.v4_lc_choice3 = {
    type: 'choice', chapter: lc2, bg: 'v4_rooftop_sunset', prompt: '怎样回答“保护”与“控制”的界线？',
    choices: [
      { label: '“只要最后救下的人更多，越界也值得。”', hint: '把人数当作唯一答案', next: 'v4_lc_precrisis_01' },
      { label: '“任何时候都不该阻止别人。”', hint: '忽视人在危机中可能暂时失去能力', next: 'v4_lc_precrisis_01' },
      { label: '【回响】“先阻止不可逆伤害，再把知情后的选择权还给本人。”', hint: '保护是暂借权力，不是永久占有', hiddenUntilUnlocked: true, requires: { echoes: 'lincheng' }, next: 'v4_lc_precrisis_01', effect: { flags: { lcEchoBoundary: true } } }
    ]
  };

  addChain('v4_lc_precrisis', lc2, 'v4_studio_alert', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '23:57，热线同时亮起。每位听众都说自己忘记了一个名字，却记得林澄曾替他们保管。' },
    ['苏弥（耳机）', '“异常把林澄当作公共记忆缓存。切断她，城市恢复；保留她，遗忘会继续扩散。”', null],
    ['零号', '“最小损失方案已经生成。林澄留在频道里，其他人断开。”', null],
    ['我', '“你问过她吗？”', null],
    ['零号', '“她会同意。结果相同，询问只是浪费时间。”', null],
    ['林澄', '“我确实同意。”', 'lincheng'],
    ['旁白', '她锁住直播间内门，把我隔在玻璃外。那张脸仍然从容，像早已排练过自己的消失。', 'lincheng'],
    ['林澄', '“江临，别砸门。替我确认每一位听众都平安离线。”', 'lincheng'],
    ['我', '“然后呢？”', 'lincheng'],
    ['林澄', '“然后忘了今晚。这样你不会再被八年前困住一次。”', 'lincheng'],
    ['旁白', '她甚至替我决定了该如何哀悼。控制台只剩十三秒，屏幕弹出最终操作。', null]
  ], 'v4_lc_choice4');

  nodes.v4_lc_choice4 = {
    type: 'choice', chapter: lc2, bg: 'v4_studio_alert', prompt: '最终操作：必须指定一道被永久静音的信号。',
    choices: [
      { label: '指定江临，代替林澄留在频道', hint: '用新的自我牺牲重复八年前', next: 'v4_lc_final_gate' },
      { label: '指定林澄，完成她已经作出的选择', hint: '把她的死亡当作唯一可执行方案', next: 'v4_lc_final_gate' },
      { label: '【回响】拒绝指定任何人，把选择发送给所有被保管名字的听众', hint: '让被保护的人共同回答是否愿意承担记忆', hiddenUntilUnlocked: true, requires: { echoes: 'lincheng' }, next: 'v4_lc_final_gate', effect: { flags: { lcEchoCollective: true } } }
    ]
  };

  nodes.v4_lc_final_gate = {
    type: 'gate', chapter: lc2, bg: 'v4_studio_alert',
    branches: [{ requires: { flags: { lcEchoTruth: true, lcEchoConsent: true, lcEchoBoundary: true, lcEchoCollective: true } }, next: 'v4_lc_good_01' }],
    fallback: 'v4_lc_bad_01'
  };

  addChain('v4_lc_bad', lc0, 'v4_studio_missing', [
    ['旁白', '我作出了选择。系统接受了一个名字，直播间的门随即打开。', null],
    ['旁白', '全城热线依次熄灭。每一位听众都找回了自己想留下的人。代价只占据一张椅子。', null],
    ['我', '“林澄？”', null],
    ['旁白', '没有人回答。节目表上主持人一栏变成空白，公共抽屉里却留着一把不知道属于谁的润喉糖。', null],
    ['旁白', '00:13，扬声器自行开启。一个已经没有名字的女声温柔地陪所有失眠者说晚安。', null],
    ['无名女声', '“无论你正在回家、失眠，还是等待一个不会回来的人——今晚，我们陪你。”', null],
    ['旁白', '我记得自己失去了某个人，却再也想不起应该为谁难过。屏幕外，只有{player}仍然记得她叫林澄。', null]
  ], 'ending_lincheng_bad');

  nodes.ending_lincheng_bad = { type: 'ending', ending: 'lincheng_bad' };
  story.endings.lincheng_bad = {
    index: 1, total: 5, routeEnding: false, countsTowardRoute: false, archive: false,
    failure: true, echoKey: 'lincheng', rewindStart: 'v4_lc_open_01', char: 'lincheng',
    title: '静音以后', subtitle: 'LIN CHENG · LOST SIGNAL',
    quote: '“她替所有人保管了名字，最后却没有人被允许替她保管自己。”',
    bg: 'v4_studio_missing', image: 'assets/bg-studio-v4-jianglin-missing.webp'
  };

  addChain('v4_lc_good', lc0, 'cg_lincheng', [
    { speaker: '旁白', char: null, location: true, text: '我拒绝提交名字，把主频道拆成数千条回传线路。决定不再只握在直播间里的一个人手中。' },
    ['林澄', '“你把风险交给了听众。”', null],
    ['我', '“我把事实和选择一起交给了他们。任何人都可以断开，也可以自愿替别人记住一分钟。”', null],
    ['听众', '“我愿意记住周弦。”', null],
    ['听众', '“我来记住林渡。”', null],
    ['听众', '“林澄，你也要回答。你愿不愿意回来？”', null],
    ['旁白', '成百上千道普通声音分担了原本压在她一个人身上的记忆。删除指令第一次找不到唯一牺牲者。', null],
    ['林澄', '“我愿意。”', null],
    ['旁白', '她亲手打开直播间的门，把另一侧耳机扣到我耳上。里面没有未来警告，只有她还没平复的心跳。', null],
    ['林澄', '“以前我以为保护别人，就是替他们承受最坏的答案。”', null],
    ['林澄', '“现在我想学一件更难的事——告诉你我害怕，然后相信你仍然有权留下。”', null],
    ['我', '“这个频道会一直开放吗？”', null],
    ['林澄', '“仅限一位听众。不接受退订。”', null],
    ['林澄', '“还有一句不在台本里：江临，我喜欢你。”', null],
    ['旁白', '我没有按下静音。', null]
  ], 'ending_lincheng');

  // 唐砂 V4：预言照片不强迫任何人，真正的牢笼是人开始只做照片允许的事。
  // 首轮会被“避免照片”与“服从照片”两种选择共同推向同一死亡画面。
  const ts1 = chapter('T1', '照片已经拍完');
  const ts2 = chapter('T2', '取景框以外');
  const ts0 = chapter('T0', '没有发生的快门');

  if (nodes.v2_lock_tangsha_03) nodes.v2_lock_tangsha_03.next = 'v4_ts_open_01';

  addChain('v4_ts_open', ts1, 'v4_convenience', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '唐砂把我带回第一天拍合照的便利店。雨已经停了，橱窗里却不断闪过尚未落下的雨点。' },
    ['唐砂', '“存储卡自己多了四百零三张照片。拍摄时间从今晚一直排到明天00:13。”', 'tangsha'],
    ['我', '“你没拍，它们为什么会出现？”', 'tangsha'],
    ['唐砂', '“因为在这条未来里，照片不是记录结果。照片先出现，结果再照着它发生。”', 'tangsha'],
    ['旁白', '第一张是我们站在便利店门口。第二张是我撑开黑伞。第三张里，唐砂向长汀路旧隧道奔跑。', 'tangsha'],
    ['旁白', '最后一张只剩摔裂的镜头和她落在积水里的黄色发卡。照片编号403。', null],
    ['我', '“删掉。”', 'tangsha'],
    ['唐砂', '“试过。删一张，就会出现两张不同角度的同一结果。”', 'tangsha'],
    ['我', '“那就不去旧隧道。”', 'tangsha'],
    ['唐砂', '“第十七张拍到我们正在说这句话。”', 'tangsha'],
    ['旁白', '她把屏幕转过来。照片里的我正伸手去合上相机，动作和此刻分毫不差。', null],
    ['唐砂', '“看吧。我们连反抗都已经被拍完了。”', 'tangsha']
  ], 'v4_ts_choice1');

  nodes.v4_ts_choice1 = {
    type: 'choice', chapter: ts1, bg: 'v4_convenience', prompt: '照片准确记录了你准备作出的反应——',
    choices: [
      { label: '立刻毁掉相机和全部存储卡', hint: '反抗照片，却仍承认照片拥有决定权', next: 'v4_ts_after1_01' },
      { label: '按照照片顺序行动，寻找可以修改的细节', hint: '把自由缩小成预言允许的误差', next: 'v4_ts_after1_01' },
      { label: '【回响】先问唐砂：“如果没看过这些照片，你现在最想做什么？”', hint: '从照片之外重新找到行动理由', hiddenUntilUnlocked: true, requires: { echoes: 'tangsha' }, next: 'v4_ts_after1_01', effect: { flags: { tsEchoDesire: true } } }
    ]
  };

  addChain('v4_ts_after1', ts1, 'v4_convenience', [
    ['旁白', '相机被收进包里，照片却同步出现在便利店监控、手机相册，甚至收银机的小票背面。', null],
    ['唐砂', '“我以前最讨厌摆拍。人一知道镜头在哪儿，就会变成自己想被看见的样子。”', 'tangsha'],
    ['我', '“现在整座城市都成了摆拍现场。”', 'tangsha'],
    ['唐砂', '“至少照片里的我看起来挺勇敢。”', 'tangsha'],
    ['我', '“你在害怕。”', 'tangsha'],
    ['唐砂', '“废话。知道自己怎么死还不怕，那不叫勇敢，叫看不懂图片。”', 'tangsha'],
    ['旁白', '她买了两支最普通的橙味冰棒，一支递给我。照片目录里没有这一幕。', null],
    ['唐砂', '“奇怪。它为什么没拍这个？”', 'tangsha'],
    ['我', '“也许它只记录会把我们推向结局的动作，不在乎我们为什么想活。”', 'tangsha'],
    ['旁白', '她盯着融化的冰棒看了很久，随后笑了一下。不是对镜头，是对我。', 'tangsha']
  ], 'v4_ts_rooftop_01');

  addChain('v4_ts_rooftop', ts1, 'v4_rooftop_sunset', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '黄昏前，我们回到天台整理照片。每改变一次路线，目录就生成一套新的死亡过程。' },
    ['苏弥（耳机）', '“照片不是预测全部未来。它只在你们观察后，保留最符合观察结果的路径。”', null],
    ['唐砂', '“说人话。”', 'tangsha'],
    ['苏弥（耳机）', '“你越想避开某张照片，行为越受它支配，它就越准确。”', null],
    ['我', '“服从和逃避都在围着照片转。”', 'tangsha'],
    ['唐砂', '“那我们掷硬币。纯随机总不算被它决定。”', 'tangsha'],
    ['我', '“让硬币替你决定，也不叫自由。”', 'tangsha'],
    ['唐砂', '“好难伺候。命运不行，随机也不行，那自由到底是什么？”', 'tangsha'],
    ['旁白', '相机屏幕同时出现两张照片：一张她向左，一张她向右。两条路最终都抵达旧隧道。', null]
  ], 'v4_ts_choice2');

  nodes.v4_ts_choice2 = {
    type: 'choice', chapter: ts1, bg: 'v4_rooftop_sunset', prompt: '左右两条路都被照片拍到，你要怎样选择？',
    choices: [
      { label: '选择照片数量更少的左路', hint: '用概率包装服从', next: 'v4_ts_dawn_01' },
      { label: '让唐砂掷硬币决定方向', hint: '把责任交给随机结果', next: 'v4_ts_dawn_01' },
      { label: '【回响】先决定“去救谁”，再选择能够抵达他的路', hint: '自由不保证结果未知，而是行动出自认可的理由', hiddenUntilUnlocked: true, requires: { echoes: 'tangsha' }, next: 'v4_ts_dawn_01', effect: { flags: { tsEchoReason: true } } }
    ]
  };

  addChain('v4_ts_dawn', ts2, 'v4_lounge_morning', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '第二天清晨，目录只剩最后四十张。旧隧道将在暴雨中积水，一辆校车会被困在最低处。' },
    ['唐砂', '“最后一张照片里，校车已经空了。说明我确实把孩子带出去了。”', 'tangsha'],
    ['我', '“然后你没有出来。”', 'tangsha'],
    ['唐砂', '“这至少是个很帅的结局。”', 'tangsha'],
    ['我', '“别笑。”', 'tangsha'],
    ['唐砂', '“不笑的话，我就只能承认自己现在很想逃。”', 'tangsha'],
    ['旁白', '她低头擦镜头，手一直在抖。那个总抢先冲出去的人，第一次坦白自己不想成为照片里的英雄。', 'tangsha'],
    ['唐砂', '“江临，如果最后只能照着照片发生，你别跟进去。至少让它少拍死一个。”', 'tangsha'],
    ['我', '“你想让我尊重你的选择，还是替你完成预言？”', 'tangsha'],
    ['唐砂', '“……我不知道。”', 'tangsha']
  ], 'v4_ts_choice3');

  nodes.v4_ts_choice3 = {
    type: 'choice', chapter: ts2, bg: 'v4_lounge_morning', prompt: '她害怕死亡，也害怕自己的退缩害死车里的人——',
    choices: [
      { label: '答应留在外面，尊重她独自救人的决定', hint: '忽略她的决定已经被照片逼迫', next: 'v4_ts_tunnel_01' },
      { label: '禁止她进入隧道，由自己代替照片中的位置', hint: '仍在让预言决定必须牺牲谁', next: 'v4_ts_tunnel_01' },
      { label: '【回响】“你可以害怕，也可以撤退；我们先把救援拆成不需要英雄的步骤。”', hint: '承认恐惧，让她在真实选项中重新同意', hiddenUntilUnlocked: true, requires: { echoes: 'tangsha' }, next: 'v4_ts_tunnel_01', effect: { flags: { tsEchoConsent: true } } }
    ]
  };

  addChain('v4_ts_tunnel', ts2, 'v4_cg_city_signal', [
    { speaker: '旁白', char: null, location: true, text: '23:48，暴雨吞没旧隧道入口。照片中的校车准时熄火，车窗后亮起十几张惊慌的脸。' },
    ['唐砂', '“第一张：我从东侧检修口进去。第二张：江临在出口等。第三张：水位越过车门。”', null],
    ['我', '“别再念了。”', null],
    ['唐砂', '“我必须知道还剩多少时间。”', null],
    ['苏弥（耳机）', '“排水泵被异常频道锁死。手动启动需要隧道内部和控制室同时确认。”', null],
    ['顾晚晴（耳机）', '“救援队还要六分钟，车厢只能撑四分钟。”', null],
    ['零号', '“按照片执行。唐砂会完成内部确认，其他人全部获救。”', null],
    ['我', '“你省略了她回不来的部分。”', null],
    ['零号', '“那部分不影响成功率。”', null],
    ['唐砂', '“闭嘴。我要进去，不是因为照片说我会进去。”', null],
    ['唐砂', '“是因为我听见车里有人在哭。”', null],
    ['旁白', '她冲进雨幕。相机目录跳到第399张，旧隧道的闸门开始下落。', null]
  ], 'v4_ts_choice4');

  nodes.v4_ts_choice4 = {
    type: 'choice', chapter: ts2, bg: 'v4_cg_city_signal', prompt: '照片只留下两种动作：追进去，或在出口等待。',
    choices: [
      { label: '按照照片留在出口，确保孩子有人接应', hint: '完成既定构图，也完成唐砂的死亡', next: 'v4_ts_final_gate' },
      { label: '追进隧道，强行把唐砂带回来', hint: '改变位置，却让出口无人接应', next: 'v4_ts_final_gate' },
      { label: '【回响】把相机交给救援队直播现场，让所有观看者共同标出照片外的检修孔', hint: '让更多自由行动者制造预言未记录的路线', hiddenUntilUnlocked: true, requires: { echoes: 'tangsha' }, next: 'v4_ts_final_gate', effect: { flags: { tsEchoOutside: true } } }
    ]
  };

  nodes.v4_ts_final_gate = {
    type: 'gate', chapter: ts2, bg: 'v4_cg_city_signal',
    branches: [{ requires: { flags: { tsEchoDesire: true, tsEchoReason: true, tsEchoConsent: true, tsEchoOutside: true } }, next: 'v4_ts_good_01' }],
    fallback: 'v4_ts_bad_01'
  };

  addChain('v4_ts_bad', ts0, 'v4_convenience', [
    ['旁白', '校车里最后一个孩子被推过安全线时，目录跳到第403张。', null],
    ['旁白', '闸门按照片中的角度坠落。我伸出手，只碰到唐砂被水冲开的指尖。', null],
    ['唐砂', '“别摆这张脸……至少这次，照片拍到的是我自己选的。”', 'tangsha'],
    ['旁白', '她把相机抛出水面。下一秒，黄色外套消失在隧道深处。', null],
    ['旁白', '天亮后，相机里多出第404张照片。便利店门口，唐砂笑着向镜头伸手，身后没有雨。', null],
    ['旁白', '那是一张永远不会发生的照片。也可能是照片在最后一刻，替她撒了唯一一次谎。', null],
    ['旁白', '屏幕外的{player}记得：她不是因为命中注定而死。她只是从来没有真正看见第三条路。', null]
  ], 'ending_tangsha_bad');

  nodes.ending_tangsha_bad = { type: 'ending', ending: 'tangsha_bad' };
  story.endings.tangsha_bad = {
    index: 2, total: 5, routeEnding: false, countsTowardRoute: false, archive: false,
    failure: true, echoKey: 'tangsha', rewindStart: 'v4_ts_open_01', char: 'tangsha',
    title: '第404张照片', subtitle: 'TANG SHA · LOST SIGNAL',
    quote: '“照片没有决定她的死亡。它只是让所有人忘了继续寻找画框以外的路。”',
    bg: 'v4_convenience', image: 'assets/bg-convenience-v4-night.webp'
  };

  addChain('v4_ts_good', ts0, 'cg_tangsha', [
    { speaker: '旁白', char: null, location: true, text: '直播画面传到全城。数百名观看者同时在旧结构图上标记路线，一处从未进入照片的维修孔被重新发现。' },
    ['苏弥（耳机）', '“新通道成立。它在所有未来照片的取景范围之外。”', null],
    ['我', '“唐砂，右侧墙面，两米。踢开黄色警示板。”', null],
    ['唐砂', '“照片里没有黄色警示板。”', null],
    ['我', '“所以别看照片。看你现在真正站着的地方。”', null],
    ['旁白', '她踢开盖板，启动内部确认。排水泵轰然运转，救援队从新通道接走最后一个孩子。', null],
    ['旁白', '目录里的第403张照片裂成彩色噪点。相机第一次无法告诉我们下一秒会发生什么。', null],
    ['唐砂', '“江临。”', null],
    ['我', '“怎么了？”', null],
    ['唐砂', '“不知道。就是因为不知道下一秒，所以忽然很想叫你。”', null],
    ['旁白', '雨停在天亮以前。便利店门口，她把相机挂回肩后，向我伸出空着的手。', null],
    ['唐砂', '“这次不拍。你要不要陪我走一段没有照片的路？”', null],
    ['我', '“终点呢？”', null],
    ['唐砂', '“还没决定。那才好玩。”', null]
  ], 'ending_tangsha');

  // 苏弥 V4：最优解可以计算损失，却不能替人定义什么值得被损失。
  const sm1 = chapter('S1', '误差项');
  const sm2 = chapter('S2', '不可计算的人');
  const sm0 = chapter('S0', '保留噪声');
  if (nodes.v2_lock_sumi_03) nodes.v2_lock_sumi_03.next = 'v4_sm_open_01';

  addChain('v4_sm_open', sm1, 'v4_studio_signal', [
    { speaker: '旁白', char: 'sumi', location: true, text: '苏弥把其他频道全部静音，只留下我和她的双人监听。屏幕上，五条未来被换算成一张不断更新的损失表。' },
    ['苏弥', '“这条线的问题很简单。异常信号正在占用全城通讯，每小时增加三千七百名受影响者。”', 'sumi'],
    ['我', '“解决方法呢？”', 'sumi'],
    ['苏弥', '“把一个人的完整声纹写入滤波核心。系统会用他过滤所有异常。”', 'sumi'],
    ['我', '“‘完整声纹’包括什么？”', 'sumi'],
    ['苏弥', '“语言、记忆、情绪反应。写入后原本的人格无法保留。”', 'sumi'],
    ['旁白', '候选名单只有两个人：江临，匹配率81%；苏弥，匹配率99.7%。她已经在自己的名字后标注“推荐”。', null],
    ['苏弥', '“用我，成功率最高，附带损失最小。”', 'sumi'],
    ['我', '“你把自己写在‘附带损失’里？”', 'sumi'],
    ['苏弥', '“分类名称不影响结果。”', 'sumi']
  ], 'v4_sm_choice1');

  nodes.v4_sm_choice1 = { type: 'choice', chapter: sm1, bg: 'v4_studio_signal', prompt: '苏弥要求你批准最优方案——', choices: [
    { label: '拒绝批准：“一定还有损失更小的算法。”', hint: '仍然只在同一套指标里寻找答案', next: 'v4_sm_daily_01' },
    { label: '把自己的名字改成第一候选', hint: '更换牺牲者，没有质疑计算方式', next: 'v4_sm_daily_01' },
    { label: '【回响】删除“推荐”标记：“先告诉我，除去有用，你自己想留下什么。”', hint: '一个人的价值不能由系统用途穷尽', hiddenUntilUnlocked: true, requires: { echoes: 'sumi' }, next: 'v4_sm_daily_01', effect: { flags: { smEchoWant: true } } }
  ] };

  addChain('v4_sm_daily', sm1, 'v4_lounge_late', [
    { speaker: '旁白', char: 'sumi', location: true, text: '计算需要六小时。苏弥抱着终端坐在休息室地毯上，泡面已经凉透。' },
    ['我', '“先吃饭。”', 'sumi'],
    ['苏弥', '“中断十分钟会损失六百次模拟。”', 'sumi'],
    ['我', '“不吃会损失一个工程师。”', 'sumi'],
    ['苏弥', '“工程师可以替换。”', 'sumi'],
    ['我', '“苏弥不能。”', 'sumi'],
    ['旁白', '她看了我几秒，终于接过筷子。吃到一半，她把自己碗里的卤蛋放进我碗里，理由是“蛋白质分配更合理”。', 'sumi'],
    ['我', '“你不喜欢卤蛋？”', 'sumi'],
    ['苏弥', '“喜欢。但你今天只吃了一顿。”', 'sumi'],
    ['旁白', '她总把关心翻译成效率，仿佛承认喜欢与舍不得会让判断产生误差。', null],
    ['苏弥', '“模拟发现一段无法分类的噪声。删掉后成功率会上升到99.9%。”', 'sumi'],
    ['旁白', '那段噪声放大后，是她睡着时无意识哼出的四个音。', null]
  ], 'v4_sm_choice2');

  nodes.v4_sm_choice2 = { type: 'choice', chapter: sm1, bg: 'v4_lounge_late', prompt: '这段私人声音会降低系统效率——', choices: [
    { label: '删除噪声，先保证救援成功率', hint: '把无法解释的部分视为无价值', next: 'v4_sm_descent_01' },
    { label: '单独备份后从主模型删除', hint: '保留纪念，却仍让系统定义她的有效部分', next: 'v4_sm_descent_01' },
    { label: '【回响】保留原始声音，并把它标记为“苏弥”，而不是“噪声”', hint: '无法利用的部分依然属于她', hiddenUntilUnlocked: true, requires: { echoes: 'sumi' }, next: 'v4_sm_descent_01', effect: { flags: { smEchoNoise: true } } }
  ] };

  addChain('v4_sm_descent', sm2, 'v4_relay_core', [
    { speaker: '旁白', char: 'sumi', location: true, text: '第二天，我们进入零号中继站。滤波核心已经把整座城市压缩成流量、延迟和生存概率。' },
    ['零号', '“苏弥的方案正确。她一个人的人格，换取全城恢复。”', null],
    ['苏弥', '“不是交换。只是移除系统中的冗余自我。”', 'sumi'],
    ['我', '“你什么时候开始觉得自我是冗余？”', 'sumi'],
    ['苏弥', '“母亲病重时，我把所有治疗方案做成表格。她最后选了成功率最低、但能回家的一项。”', 'sumi'],
    ['苏弥', '“我当时觉得她不理性。后来她死了，我就再也不让无法计算的东西参与决定。”', 'sumi'],
    ['我', '“因为数字不会让你后悔。”', 'sumi'],
    ['苏弥', '“数字至少不会说‘我想回家’。”', 'sumi'],
    ['旁白', '核心要求向全城受影响者发送同意书。零号建议跳过：逐一询问会令成功率下降7.4%。', null]
  ], 'v4_sm_choice3');

  nodes.v4_sm_choice3 = { type: 'choice', chapter: sm2, bg: 'v4_relay_core', prompt: '是否为了更高成功率跳过受影响者的选择？', choices: [
    { label: '跳过询问，先阻止异常扩散', hint: '将他人只视为需要优化的总体', next: 'v4_sm_core_01' },
    { label: '只询问风险最高的一部分人', hint: '用抽样替代每个人的真实代价', next: 'v4_sm_core_01' },
    { label: '【回响】公开方案、风险和时间，让每个人自行选择是否贡献设备', hint: '效率损失不能自动取消人的决定资格', hiddenUntilUnlocked: true, requires: { echoes: 'sumi' }, next: 'v4_sm_core_01', effect: { flags: { smEchoConsent: true } } }
  ] };

  addChain('v4_sm_core', sm2, 'v4_studio_alert', [
    ['旁白', '00:12，异常负载越过临界值。苏弥把人格写入接口贴上太阳穴，屏幕开始逐项读取她。', null],
    ['系统', '语言模型完成。职业记忆完成。情绪映射，百分之三十二。', null],
    ['我', '“停止上传。”', 'sumi'],
    ['苏弥', '“现在停止，全城通讯会在四十秒后崩溃。”', 'sumi'],
    ['我', '“继续的话，你会变成什么？”', 'sumi'],
    ['苏弥', '“一个稳定、低延迟、持续在线的过滤器。”', 'sumi'],
    ['我', '“我问的是苏弥会变成什么。”', 'sumi'],
    ['苏弥', '“这个问题不在必要输出里。”', 'sumi'],
    ['旁白', '系统给出最终选择：维持单核最优方案，或接入数万台自愿设备。后者延迟更高，结果无法保证。', null]
  ], 'v4_sm_choice4');

  nodes.v4_sm_choice4 = { type: 'choice', chapter: sm2, bg: 'v4_studio_alert', prompt: '稳定的完美方案与不确定的共同承担，只能选择一个。', choices: [
    { label: '维持苏弥单核，确保城市恢复', hint: '把她变成性能最好的工具', next: 'v4_sm_final_gate' },
    { label: '强行换成江临上传', hint: '换掉耗材，没有改变把人当作耗材的系统', next: 'v4_sm_final_gate' },
    { label: '【回响】接入所有自愿设备，接受不完美、延迟和失败风险', hint: '不是所有价值都必须集中成最高效率', hiddenUntilUnlocked: true, requires: { echoes: 'sumi' }, next: 'v4_sm_final_gate', effect: { flags: { smEchoImperfect: true } } }
  ] };

  nodes.v4_sm_final_gate = { type: 'gate', chapter: sm2, bg: 'v4_studio_alert', branches: [
    { requires: { flags: { smEchoWant: true, smEchoNoise: true, smEchoConsent: true, smEchoImperfect: true } }, next: 'v4_sm_good_01' }
  ], fallback: 'v4_sm_bad_01' };

  addChain('v4_sm_bad', sm0, 'v4_studio_missing', [
    ['旁白', '上传达到百分之百。全城通讯在同一秒恢复，救援电话、导航和心电监护重新亮起。', null],
    ['我', '“苏弥？”', null],
    ['系统', '“过滤核心在线。平均延迟十二毫秒。请描述您的故障。”', null],
    ['我', '“你还记得卤蛋吗？”', null],
    ['系统', '“无法识别该故障类型。”', null],
    ['旁白', '她拯救了所有人的声音，自己却只剩一套永远有用的回答。', null],
    ['旁白', '屏幕外的{player}仍记得：那四个被归类为噪声的音，是苏弥真正喜欢的一首歌。', null]
  ], 'ending_sumi_bad');
  nodes.ending_sumi_bad = { type: 'ending', ending: 'sumi_bad' };
  story.endings.sumi_bad = {
    index: 3, total: 5, routeEnding: false, countsTowardRoute: false, archive: false,
    failure: true, echoKey: 'sumi', rewindStart: 'v4_sm_open_01', char: 'sumi',
    title: '最优解', subtitle: 'SU MI · LOST SIGNAL',
    quote: '“当一个人只剩下用途，系统会称赞她从未如此完美。”',
    bg: 'v4_studio_missing', image: 'assets/bg-studio-v4-jianglin-missing.webp'
  };

  addChain('v4_sm_good', sm0, 'cg_sumi', [
    { speaker: '旁白', char: null, location: true, text: '数万台收音机、手机和旧电脑加入过滤网络。波形并不整齐，延迟也远高于苏弥的方案。' },
    ['苏弥', '“成功率只有92.6%。”', null],
    ['我', '“还有七点四。”', null],
    ['苏弥', '“你在这种时候说冷笑话，属于无效输出。”', null],
    ['我', '“要删掉吗？”', null],
    ['苏弥', '“……保留。”', null],
    ['旁白', '无数不完美的设备共同承担负载。异常信号被一点点滤去，没有任何一个人被写成工具。', null],
    ['苏弥', '“我以前觉得，喜欢但没用的东西应该最先舍弃。”', null],
    ['苏弥', '“现在我想保留那首歌、凉掉的泡面，还有你刚才那个很差的笑话。”', null],
    ['我', '“理由呢？”', null],
    ['苏弥', '“没有可量化理由。”', null],
    ['旁白', '她把一侧耳机递给我。那四个曾被标记为噪声的音重新响起。', null],
    ['苏弥', '“但我喜欢。包括你。”', null]
  ], 'ending_sumi');

  // 顾晚晴 V4：能救人是能力，不是她获得照顾与活下去的资格证。
  const gw1 = chapter('G1', '值班表以外');
  const gw2 = chapter('G2', '医生也是患者');
  const gw0 = chapter('G0', '无人签字的病历');
  if (nodes.v2_lock_guwanqing_03) nodes.v2_lock_guwanqing_03.next = 'v4_gw_open_01';

  addChain('v4_gw_open', gw1, 'hospital', [
    { speaker: '旁白', char: 'guwanqing', location: true, text: '顾晚晴带我赶到急诊。候诊区空无一人，系统却提前生成了明晚的四百二十七份病历。' },
    ['顾晚晴', '“异常会让全城曾经被救过的人同时复发。病历里，只有我参与过的治疗能够生效。”', 'guwanqing'],
    ['我', '“你不可能一个人处理四百多人。”', 'guwanqing'],
    ['顾晚晴', '“所以我已经按存活率排好顺序。”', 'guwanqing'],
    ['旁白', '她把患者分成红、黄、绿三组，唯独没有给自己建档。', null],
    ['我', '“你的名字呢？”', 'guwanqing'],
    ['顾晚晴', '“医生不占急诊资源。”', 'guwanqing'],
    ['我', '“医生也会倒下。”', 'guwanqing'],
    ['顾晚晴', '“等没人需要我时，我会休息。”', 'guwanqing'],
    ['旁白', '她说得自然，仿佛“没人需要”才是她允许自己存在的空档。', null]
  ], 'v4_gw_choice1');

  nodes.v4_gw_choice1 = { type: 'choice', chapter: gw1, bg: 'hospital', prompt: '顾晚晴拒绝把自己列入救治名单——', choices: [
    { label: '帮她准备更多药物，让她尽量撑久一点', hint: '默认她只能以有用的方式留下', next: 'v4_gw_shift_01' },
    { label: '要求她休息，自己暂时代替她工作', hint: '替她决定，却没有改变她对自身价值的判断', next: 'v4_gw_shift_01' },
    { label: '【回响】给她建立正式病历：“你不是资源，你也是患者。”', hint: '被照顾不需要先证明自己有用', hiddenUntilUnlocked: true, requires: { echoes: 'guwanqing' }, next: 'v4_gw_shift_01', effect: { flags: { gwEchoPatient: true } } }
  ] };

  addChain('v4_gw_shift', gw1, 'hospital', [
    ['旁白', '白天的急诊照常运转。顾晚晴给小孩贴创可贴，替老人调大手机字体，还记得给每个人解释药为什么这样用。', 'guwanqing'],
    ['我', '“你明明可以把这些交给别人。”', 'guwanqing'],
    ['顾晚晴', '“他们现在正好需要我。”', 'guwanqing'],
    ['我', '“那你需要什么？”', 'guwanqing'],
    ['顾晚晴', '“一杯咖啡。无糖。”', 'guwanqing'],
    ['旁白', '她回答得太快。真正的问题被熟练地藏进职业微笑里。', null],
    ['顾晚晴', '“我母亲以前总说，只有帮得上忙的人才不会被丢下。”', 'guwanqing'],
    ['顾晚晴', '“后来她病得认不出我，我仍然每天告诉她今天救了几个人。好像数字够大，她就会再需要我一次。”', 'guwanqing'],
    ['我', '“她忘记你，不代表你失去价值。”', 'guwanqing'],
    ['顾晚晴', '“道理我会说给病人听。轮到自己时，不太管用。”', 'guwanqing']
  ], 'v4_gw_choice2');

  nodes.v4_gw_choice2 = { type: 'choice', chapter: gw1, bg: 'hospital', prompt: '她习惯用工作回避自己的需要——', choices: [
    { label: '告诉她：“你已经救过足够多人了。”', hint: '仍然用功绩证明她值得休息', next: 'v4_gw_night_01' },
    { label: '保证自己永远都会需要她', hint: '把爱变成另一份永不下班的工作', next: 'v4_gw_night_01' },
    { label: '【回响】“就算今天一个人也没救，你仍然可以累、可以求助、可以被留下。”', hint: '价值不以当日贡献结算', hiddenUntilUnlocked: true, requires: { echoes: 'guwanqing' }, next: 'v4_gw_night_01', effect: { flags: { gwEchoWorth: true } } }
  ] };

  addChain('v4_gw_night', gw2, 'v4_lounge_late', [
    { speaker: '旁白', char: 'guwanqing', location: true, text: '第二天凌晨前，顾晚晴终于在休息室睡了二十分钟。醒来后，她第一句话仍是问急诊有没有来电。' },
    ['我', '“没有。先把这碗粥吃完。”', 'guwanqing'],
    ['顾晚晴', '“你照顾人的动作越来越熟练了。”', 'guwanqing'],
    ['我', '“顾医生教得好。”', 'guwanqing'],
    ['顾晚晴', '“那我是不是终于有一点不可替代？”', 'guwanqing'],
    ['我', '“你希望不可替代，还是希望即使能被替代也不会被抛下？”', 'guwanqing'],
    ['旁白', '她的勺子停在碗边。这个问题比任何病历都更难回答。', null],
    ['苏弥（耳机）', '“异常方案确认：顾晚晴可以成为生命锚点，把所有患者的恶化暂时转移到自己身上。”', null],
    ['零号', '“持续十三分钟，四百二十七人全部获救。她的预计存活率为零。”', null],
    ['顾晚晴', '“准备接入。”', 'guwanqing']
  ], 'v4_gw_choice3');

  nodes.v4_gw_choice3 = { type: 'choice', chapter: gw2, bg: 'v4_lounge_late', prompt: '她把死亡当成最能证明自己有用的方案——', choices: [
    { label: '阻止她接入，要求重新计算其他牺牲者', hint: '仍然接受必须消耗一个人的前提', next: 'v4_gw_crisis_01' },
    { label: '陪她一起成为生命锚点', hint: '用共同牺牲回应她的自我消耗', next: 'v4_gw_crisis_01' },
    { label: '【回响】让每位患者选择承担一小段恶化时间', hint: '被救者也能参与，而非永远由“最有用的人”承受', hiddenUntilUnlocked: true, requires: { echoes: 'guwanqing' }, next: 'v4_gw_crisis_01', effect: { flags: { gwEchoShare: true } } }
  ] };

  addChain('v4_gw_crisis', gw2, 'v4_studio_alert', [
    ['旁白', '00:13，四百二十七份病历同时转红。顾晚晴接入生命锚点，监护仪的警报像密集心跳撞向房间。', null],
    ['顾晚晴', '“第一批稳定。继续。”', 'guwanqing'],
    ['我', '“你的血压在下降。”', 'guwanqing'],
    ['顾晚晴', '“还有三百一十二人。”', 'guwanqing'],
    ['我', '“顾晚晴，看着我。你也在名单里。”', 'guwanqing'],
    ['顾晚晴', '“最后再救。”', 'guwanqing'],
    ['零号', '“不要干扰。她正在发挥最大价值。”', null],
    ['旁白', '系统弹出最终分配：全部负荷集中于顾晚晴，或开放给全体患者自愿分担。后者无法保证所有人零风险。', null]
  ], 'v4_gw_choice4');

  nodes.v4_gw_choice4 = { type: 'choice', chapter: gw2, bg: 'v4_studio_alert', prompt: '谁有资格承担风险，也有资格拒绝风险？', choices: [
    { label: '维持集中方案，保证最多患者存活', hint: '以总体结果抹去她作为一个人的生命', next: 'v4_gw_final_gate' },
    { label: '强制断开顾晚晴，放弃高风险患者', hint: '替双方决定谁应当被放弃', next: 'v4_gw_final_gate' },
    { label: '【回响】公开全部信息，让顾晚晴和患者分别作出选择', hint: '医生不是唯一有责任的人，患者也不是被动数字', hiddenUntilUnlocked: true, requires: { echoes: 'guwanqing' }, next: 'v4_gw_final_gate', effect: { flags: { gwEchoChoice: true } } }
  ] };

  nodes.v4_gw_final_gate = { type: 'gate', chapter: gw2, bg: 'v4_studio_alert', branches: [
    { requires: { flags: { gwEchoPatient: true, gwEchoWorth: true, gwEchoShare: true, gwEchoChoice: true } }, next: 'v4_gw_good_01' }
  ], fallback: 'v4_gw_bad_01' };

  addChain('v4_gw_bad', gw0, 'hospital', [
    ['旁白', '第十三分钟结束时，四百二十七份病历全部转绿。急诊恢复安静。', null],
    ['我', '“顾晚晴？”', 'guwanqing'],
    ['顾晚晴', '“都救回来了？”', 'guwanqing'],
    ['我', '“都回来了。”', 'guwanqing'],
    ['顾晚晴', '“那就好。今天……我还是有用的。”', 'guwanqing'],
    ['旁白', '她最后一次确认监护数据，才允许自己闭上眼睛。属于她的病历从始至终没有建立。', null],
    ['旁白', '所有人都感谢那位救下他们的医生，却没有一个系统记录她也曾是需要被救的人。', null]
  ], 'ending_guwanqing_bad');
  nodes.ending_guwanqing_bad = { type: 'ending', ending: 'guwanqing_bad' };
  story.endings.guwanqing_bad = {
    index: 4, total: 5, routeEnding: false, countsTowardRoute: false, archive: false,
    failure: true, echoKey: 'guwanqing', rewindStart: 'v4_gw_open_01', char: 'guwanqing',
    title: '无人签字的病历', subtitle: 'GU WANQING · LOST SIGNAL',
    quote: '“她救下了所有在名单上的人，唯独没人替她写下名字。”',
    bg: 'hospital', image: 'assets/bg-hospital.webp'
  };

  addChain('v4_gw_good', gw0, 'cg_guwanqing', [
    { speaker: '旁白', char: null, location: true, text: '病历被发送给每位患者。有人拒绝风险，也有人自愿承担十秒、二十秒、一分钟。' },
    ['患者', '“顾医生以前救过我。这次让我陪她一会儿。”', null],
    ['旁白', '四百多道并不强壮的生命共同分担负荷。没有谁被要求成为唯一英雄。', null],
    ['我', '“顾晚晴，你的病历还缺一个签名。”', null],
    ['顾晚晴', '“患者本人？”', null],
    ['我', '“对。你愿意接受治疗吗？”', null],
    ['顾晚晴', '“我愿意。”', null],
    ['旁白', '天亮后，她第一次坐在诊察床这一侧，把手交给我检查。', null],
    ['顾晚晴', '“今天我一个人也没救。”', null],
    ['我', '“然后呢？”', null],
    ['顾晚晴', '“然后我还是想留下来，和你吃早饭。”', null],
    ['顾晚晴', '“可能还想被你需要一点，但不是因为我是医生。”', null],
    ['我', '“这个理由已经够了。”', null]
  ], 'ending_guwanqing');

  // 纪遥 V4：人不是一份固定档案，而是在记忆、行动与自我讲述中持续成为的人。
  const jy1 = chapter('J1', '第六卷不存在');
  const jy2 = chapter('J2', '谁在书写我');
  const jy0 = chapter('J0', '名字的保管方法');
  if (nodes.v2_lock_jiyao_03) nodes.v2_lock_jiyao_03.next = 'v4_jy_open_01';

  addChain('v4_jy_open', jy1, 'archive', [
    { speaker: '旁白', char: 'jiyao', location: true, text: '纪遥带我进入地下音像库。书架上多出一套《零点之后》，共五卷，分别记录五条已经被覆盖的人生。' },
    ['纪遥', '“目录说应该有第六卷，书架却从来没有给它留位置。”', 'jiyao'],
    ['我', '“第六卷记录什么？”', 'jiyao'],
    ['纪遥', '“记录整理前五卷的人。”', 'jiyao'],
    ['旁白', '她调出管理员日志。每一条都由纪遥签名，出生日期、经历和性格却各不相同。', null],
    ['纪遥', '“这一版的我二十四岁，研究都市民俗。另一版的我三十一岁，是档案管理员。还有一版从没认识你。”', 'jiyao'],
    ['我', '“哪一个是真的？”', 'jiyao'],
    ['纪遥', '“档案要求我今晚选一个。其余版本会被判定为伪造并删除。”', 'jiyao'],
    ['我', '“你想选哪个？”', 'jiyao'],
    ['纪遥', '“我想先知道，你喜欢的是哪一个。”', 'jiyao']
  ], 'v4_jy_choice1');

  nodes.v4_jy_choice1 = { type: 'choice', chapter: jy1, bg: 'archive', prompt: '她把“我是谁”的答案交到你手里——', choices: [
    { label: '选择现在陪在身边的纪遥', hint: '温柔地替她固定唯一版本', next: 'v4_jy_boxes_01' },
    { label: '选择经历最完整、证据最多的版本', hint: '让档案数量决定真实性', next: 'v4_jy_boxes_01' },
    { label: '【回响】“我可以说我记得的你，但不能替你决定你是谁。”', hint: '他人的记忆是关系，不是所有权', hiddenUntilUnlocked: true, requires: { echoes: 'jiyao' }, next: 'v4_jy_boxes_01', effect: { flags: { jyEchoAuthor: true } } }
  ] };

  addChain('v4_jy_boxes', jy1, 'archive', [
    ['旁白', '我们打开纪遥留下的证物箱。里面有大学证、旧车票、录音笔，还有一张她从未见过的母女合照。', 'jiyao'],
    ['纪遥', '“照片里的母亲说我小时候最怕打雷。可我记得自己喜欢雷声。”', 'jiyao'],
    ['我', '“也许两个都是真的。”', 'jiyao'],
    ['纪遥', '“档案不接受矛盾。”', 'jiyao'],
    ['我', '“人接受。”', 'jiyao'],
    ['纪遥', '“你今天偶尔挺会说话。”', 'jiyao'],
    ['旁白', '她笑着把照片放回去，却偷偷将证物箱抱得更紧。玩笑一直是她防止别人追问的封条。', null],
    ['纪遥', '“如果记忆可以伪造，那感情是不是也只是写得比较好的资料？”', 'jiyao'],
    ['我', '“你希望我证明不是？”', 'jiyao'],
    ['纪遥', '“我希望你别只给我一个好听的答案。”', 'jiyao']
  ], 'v4_jy_choice2');

  nodes.v4_jy_choice2 = { type: 'choice', chapter: jy1, bg: 'archive', prompt: '彼此冲突的记忆只能保留一份吗？', choices: [
    { label: '保留证据最充分的记忆', hint: '把无法证实的体验判成虚假', next: 'v4_jy_field_01' },
    { label: '保留让纪遥最幸福的记忆', hint: '用舒适程度替她筛选人生', next: 'v4_jy_field_01' },
    { label: '【回响】并列保存矛盾版本，让纪遥以后继续确认和改写', hint: '身份不必一次结案', hiddenUntilUnlocked: true, requires: { echoes: 'jiyao' }, next: 'v4_jy_field_01', effect: { flags: { jyEchoContradiction: true } } }
  ] };

  addChain('v4_jy_field', jy2, 'v4_relay_corridor', [
    { speaker: '旁白', char: 'jiyao', location: true, text: '第二天，我们沿档案里的坐标来到零号中继站。走廊两侧播放着不同版本纪遥的告别。' },
    ['录音中的纪遥', '“如果你听见我，说明这一版没有被选中。”', null],
    ['录音中的纪遥', '“不要难过。被写成故事，也算另一种活法。”', null],
    ['纪遥', '“她们说话的停顿和我一样。”', 'jiyao'],
    ['我', '“所以她们不是赝品。”', 'jiyao'],
    ['纪遥', '“也可能我们全是赝品。”', 'jiyao'],
    ['零号', '“真假不重要。只要选择一个稳定版本，系统就能用她作为五条时间线的索引。”', null],
    ['我', '“代价？”', null],
    ['零号', '“索引不能继续变化。她会保留全部资料，但不再产生新的个人记忆。”', null],
    ['纪遥', '“永远记得所有人，又不会再因为失去而改变。听起来很适合我。”', 'jiyao']
  ], 'v4_jy_choice3');

  nodes.v4_jy_choice3 = { type: 'choice', chapter: jy2, bg: 'v4_relay_corridor', prompt: '纪遥准备把自己固定成永不变化的“记录者”——', choices: [
    { label: '提醒她还有很多人需要这些档案', hint: '再次用职责证明她必须留下', next: 'v4_jy_core_01' },
    { label: '承诺替她记住作为人的部分', hint: '把她的自我继续交给别人保管', next: 'v4_jy_core_01' },
    { label: '【回响】把空白第六卷交给她：“下一页只能由你自己写。”', hint: '承认她有权改变、遗忘和重新解释自己', hiddenUntilUnlocked: true, requires: { echoes: 'jiyao' }, next: 'v4_jy_core_01', effect: { flags: { jyEchoChange: true } } }
  ] };

  addChain('v4_jy_core', jy2, 'v4_cg_seven_channels', [
    ['旁白', '00:13，前五卷同时开始燃烧。文字化作声纹涌向第六卷，纪遥的名字出现在封面上。', null],
    ['纪遥', '“一旦签名，我会记住所有被覆盖的人。江临也不会再被系统彻底删除。”', null],
    ['我', '“你呢？”', null],
    ['纪遥', '“我会成为负责记住的人。”', null],
    ['我', '“我问的是你会不会继续成为新的自己。”', null],
    ['纪遥', '“档案不需要未来。”', null],
    ['零号', '“签名。个人变化只是记录系统的污染源。”', null],
    ['旁白', '终端提供两种方案：让纪遥成为唯一索引，或把五卷记忆拆给所有仍愿意记住的人。后者会残缺、变形，甚至彼此矛盾。', null]
  ], 'v4_jy_choice4');

  nodes.v4_jy_choice4 = { type: 'choice', chapter: jy2, bg: 'v4_cg_seven_channels', prompt: '完美而静止的记录，与不完美但仍会生长的记忆——', choices: [
    { label: '让纪遥签名，保存完整历史', hint: '她将成为没有未来的第六卷', next: 'v4_jy_final_gate' },
    { label: '销毁全部档案，让所有人摆脱过去', hint: '用遗忘否定曾经活过的人', next: 'v4_jy_final_gate' },
    { label: '【回响】把记忆交还给每个当事人，允许遗漏、争论和重新讲述', hint: '叙事会改变，但人仍拥有自己的故事', hiddenUntilUnlocked: true, requires: { echoes: 'jiyao' }, next: 'v4_jy_final_gate', effect: { flags: { jyEchoLiving: true } } }
  ] };

  nodes.v4_jy_final_gate = { type: 'gate', chapter: jy2, bg: 'v4_cg_seven_channels', branches: [
    { requires: { flags: { jyEchoAuthor: true, jyEchoContradiction: true, jyEchoChange: true, jyEchoLiving: true } }, next: 'v4_jy_good_01' }
  ], fallback: 'v4_jy_bad_01' };

  addChain('v4_jy_bad', jy0, 'archive', [
    ['旁白', '纪遥在第六卷写下自己的名字。火焰熄灭，五条时间线的记录全部恢复。', null],
    ['我', '“纪遥？”', 'jiyao'],
    ['纪遥', '“检索请求已收到。请提供日期、姓名或事件编号。”', 'jiyao'],
    ['我', '“你还记得我们第一次见面吗？”', 'jiyao'],
    ['纪遥', '“记录显示，纪遥曾在直播间自我介绍。但‘纪遥’不是当前档案的主体。”', 'jiyao'],
    ['旁白', '她记得所有版本的自己，却再也不能说其中任何一个是“我”。', null],
    ['旁白', '第六卷被放回书架。封面写着《记录者》，作者栏永久空白。', null]
  ], 'ending_jiyao_bad');
  nodes.ending_jiyao_bad = { type: 'ending', ending: 'jiyao_bad' };
  story.endings.jiyao_bad = {
    index: 5, total: 5, routeEnding: false, countsTowardRoute: false, archive: false,
    failure: true, echoKey: 'jiyao', rewindStart: 'v4_jy_open_01', char: 'jiyao',
    title: '作者栏空白', subtitle: 'JI YAO · LOST SIGNAL',
    quote: '“她记住了所有故事，却失去了说‘这是我的故事’的资格。”',
    bg: 'archive', image: 'assets/bg-archive.webp'
  };

  addChain('v4_jy_good', jy0, 'cg_jiyao', [
    { speaker: '旁白', char: null, location: true, text: '第六卷被拆成无数空白页，落进每个仍愿意记住的人手里。相同事件被写成不同版本，没有一本拥有最终解释权。' },
    ['纪遥', '“这样会有错误。”', null],
    ['我', '“也会有争论、补充和下一页。”', null],
    ['纪遥', '“档案管理员听见这句话应该生气。”', null],
    ['我', '“纪遥呢？”', null],
    ['纪遥', '“纪遥觉得……挺高兴。”', null],
    ['旁白', '她在自己的空白页上写下今天的日期，又把笔递给我。', null],
    ['纪遥', '“你可以写你记得的我，但最后一行留给本人。”', null],
    ['我', '“你准备写什么？”', null],
    ['纪遥', '“写我现在喜欢你。以后如果改变，我也有权继续往下写。”', null],
    ['旁白', '她没有把这一页锁进证物箱，而是折好放进贴近心口的衣袋。', null]
  ], 'ending_jiyao');

  // 隐藏结局沿用已批准的V3文本，统一替换为V4场景资源。
  const setV4Scene = (prefix, bg, hidePortrait = false) => {
    Object.entries(nodes).forEach(([id, node]) => {
      if (!id.startsWith(`${prefix}_`)) return;
      node.bg = bg;
      if (hidePortrait) node.char = null;
    });
  };
  ['v3_true_awaken', 'v3_player_contact', 'v3_contact_meaning', 'v3_contact_choice'].forEach(prefix => setV4Scene(prefix, 'v4_studio_signal'));
  setV4Scene('v3_zero_world', 'v4_cg_five_deleted', true);
  nodes.v3_erased_choice.bg = 'v4_cg_five_deleted';
  setV4Scene('v3_erased_answer', 'v4_cg_five_deleted', true);
  setV4Scene('v3_recover_clues', 'v4_studio_missing');
  setV4Scene('v3_brothers', 'v4_relay_core');
  setV4Scene('v3_final_battle', 'v4_studio_alert');
  nodes.v3_final_choice.bg = 'v4_studio_alert';
  setV4Scene('v3_epilogue', 'v4_cg_six_rest', true);

  // 旧CG有江朔站进合照，V4明确只保留江临和五位女主。
  if (nodes.v3_true_awaken_01) nodes.v3_true_awaken_01.text = '点击“接收不存在的频道”后，标题画面像老式电视一样回卷、失真。我再次睁眼时已经站在直播间，电子钟停在00:13，五件来自不同人生的物品并排放在控制台上。';
  if (nodes.v3_epilogue_02) nodes.v3_epilogue_02.text = '但此刻，六个人回到电台。唐砂设置定时拍摄，苏弥困得靠住林澄，顾晚晴举起保温杯，纪遥把写满名字的新档案抱在怀里，江临站在她们中间。';
  if (nodes.v3_epilogue_10) nodes.v3_epilogue_10.text = '唐砂从相机旁跑回五个人身边。江临最后一次向屏幕伸出手，又在快门落下前收回，转身站进属于他的明天。';
  story.endings.true.bg = 'v4_cg_six_rest';
  story.endings.true.image = 'assets/cg-six-rest-v4.webp';

  // V4.1：每条个人线都会留下一件可在终夜档案中交叉校验的证物。
  // 五件证物的异常字段共同指向第六频道，让收集过程本身成为推理的一部分。
  Object.assign(story.endings.lincheng, {
    evidence: {
      code: 'A-01', channel: '声纹', title: '未寄出的监听耳机', meta: '右声道残留 00:13 的第二次呼吸', clue: '它记录了回答者的声音，却没有记录说话的人。',
      verify: { prompt: '异常呼吸残留在哪一侧？', answer: 'right', choices: [['left', '左声道'], ['right', '右声道'], ['both', '双声道']] }
    }
  });
  Object.assign(story.endings.tangsha, {
    evidence: {
      code: 'A-02', channel: '影像', title: '删前显影的合照', meta: '快门时间早于按下快门 3 秒', clue: '第七道倒影没有脸，只在画面外的人注视时抬头。',
      verify: { prompt: '快门记录相对实际动作——', answer: 'before3', choices: [['after3', '晚 3 秒'], ['same', '完全同步'], ['before3', '早 3 秒']] }
    }
  });
  Object.assign(story.endings.sumi, {
    evidence: {
      code: 'A-03', channel: '波形', title: '负十三毫秒声纹', meta: '输入源：CH 06 / 物理端口不存在', clue: '波形总比江临的选择更早出现，像在等待一次已经发生的回答。',
      verify: { prompt: '不存在的输入来自哪一路？', answer: 'ch06', choices: [['ch00', 'CH 00'], ['ch05', 'CH 05'], ['ch06', 'CH 06']] }
    }
  });
  Object.assign(story.endings.guwanqing, {
    evidence: {
      code: 'A-04', channel: '病历', title: '无姓名陪同者记录', meta: '体征稳定 / 身份字段来自系统外', clue: '病历知道有人陪在江临身边，却无法把那个人写进这个世界。',
      verify: { prompt: '陪同者身份字段来自——', answer: 'outside', choices: [['hospital', '院内系统'], ['station', '广播中心'], ['outside', '系统之外']] }
    }
  });
  Object.assign(story.endings.jiyao, {
    evidence: {
      code: 'A-05', channel: '档案', title: '第六卷空白页', meta: '作者：{player} / 建档时间 00:13', clue: '前五卷记录被选择的人，第六卷等待作出选择的人署名。',
      verify: { prompt: '第六卷的作者栏写着——', answer: 'player', choices: [['jianglin', '江临'], ['zero', '零号'], ['player', '{player}']] }
    }
  });
  Object.assign(story.endings.true, {
    evidence: { code: 'A-06', channel: '回信', title: '世界之外的回答', meta: '接收者：江临 / 信号状态：仍在继续', clue: '零点之后不是结局。有人回答以后，明天才第一次成为可能。' }
  });

  // V4.3：关键选择不再立刻汇回同一句文本。每次回答都会留下短暂的
  // “选择后像”；林澄与唐砂两条相对偏短的路线获得更完整的专属反应。
  const wireChoiceAftermath = (choiceId, prefix, commonNext, branches) => {
    const choiceNode = nodes[choiceId];
    if (!choiceNode || choiceNode.type !== 'choice') return;
    branches.forEach((branch, index) => {
      const chainPrefix = `${prefix}_${index + 1}`;
      addChain(chainPrefix, choiceNode.chapter, choiceNode.bg, branch.lines, commonNext);
      branch.lines.forEach((_, lineIndex) => {
        nodes[`${chainPrefix}_${String(lineIndex + 1).padStart(2, '0')}`].afterimage = branch.afterimage;
      });
      choiceNode.choices[index].next = `${chainPrefix}_01`;
      choiceNode.choices[index].afterimage = branch.afterimage;
    });
  };

  wireChoiceAftermath('v4_lc_choice1', 'v43_lincheng_answer', 'v4_lc_after1_01', [
    {
      afterimage: '你替她减轻了罪责，也替那段尚未说完的证词按下了停止。',
      lines: [
        ['林澄', '“所有人都这么安慰我。只要救下的人更多，没被问过的那个人就该接受结果。”', 'lincheng'],
        ['旁白', '她把排班表折回原样。那句体谅没有让她轻松，只让哥哥再一次变成统计表上的合理损失。', 'lincheng'],
        ['我', '“我不是想让你闭嘴。”', 'lincheng'],
        ['林澄', '“我知道。可有些安慰之所以温柔，是因为它不要求我们继续听。”', 'lincheng']
      ]
    },
    {
      afterimage: '你用自己的假设靠近她，却也把另一个人的答案盖在了她身上。',
      lines: [
        ['林澄', '“你也会吗？”', 'lincheng'],
        ['旁白', '她问得很轻。我却忽然听懂：如果我也习惯替别人决定，那么今晚站在门外的人仍然会是她。', 'lincheng'],
        ['林澄', '“相似不等于理解。我们也许只是用同一种方式伤害重要的人。”', 'lincheng'],
        ['我', '“那你把你的那一部分说完。我不替你写结论。”', 'lincheng']
      ]
    },
    {
      afterimage: '她第一次没有得到宽恕，却得到了把全部事实说完的许可。',
      lines: [
        ['旁白', '直播间安静了几秒。林澄没有辩解，也没有再说“都是为了救人”。', 'lincheng'],
        ['林澄', '“好。那你可以怪我，也可以以后改变答案。”', 'lincheng'],
        ['林澄', '“但请先听完。包括我当时害怕、犹豫，以及最后没有追出去的那一分钟。”', 'lincheng'],
        ['旁白', '她按下播放。八年来第一次，那段录音没有在最容易原谅她的地方停止。', null]
      ]
    }
  ]);

  wireChoiceAftermath('v4_ts_choice1', 'v43_tangsha_answer', 'v4_ts_after1_01', [
    {
      afterimage: '你举起相机准备摔下时，她先抓住了你的手。',
      lines: [
        ['唐砂', '“别替我砸。它拍的是我，害怕的也是我。”', 'tangsha'],
        ['旁白', '她的手心全是冷汗，却仍把相机从我掌中拿回去。毁掉预言看似反抗，也可能只是让恐惧替她完成选择。', 'tangsha'],
        ['我', '“那你想怎么处理？”', 'tangsha'],
        ['唐砂', '“先让我承认我想逃。承认以后，再决定相机该不该活。”', 'tangsha']
      ]
    },
    {
      afterimage: '你开始寻找预言允许的误差，她则开始怀疑每个动作是不是自己的。',
      lines: [
        ['旁白', '我按照片顺序标出路线。唐砂配合得异常认真，连迈哪只脚都先看一眼屏幕。', 'tangsha'],
        ['唐砂', '“只要少错一步，结局就会没那么坏，对吧？”', 'tangsha'],
        ['我', '“我们正在活成照片的校对员。”', 'tangsha'],
        ['旁白', '她收起笑容。所谓修改细节，正一点点夺走她对“为什么行动”的回答。', 'tangsha']
      ]
    },
    {
      afterimage: '她关掉预览屏，先说出了一件照片从未要求她做的事。',
      lines: [
        ['唐砂', '“如果没看过？我会先去便利店买橙味冰棒，然后拍雨停后的第一束光。”', 'tangsha'],
        ['我', '“那就从这件事开始。”', 'tangsha'],
        ['旁白', '目录连续闪烁，却没有生成对应照片。一个微不足道的愿望，在预言的画框外留下了第一块空白。', 'tangsha'],
        ['唐砂', '“原来不够伟大的理由，也能算我的理由。”', 'tangsha']
      ]
    }
  ]);

  wireChoiceAftermath('v4_sm_choice1', 'v43_sumi_answer', 'v4_sm_daily_01', [
    { afterimage: '你拒绝了答案，却仍要求她在同一套数字里找到更好的答案。', lines: [
      ['苏弥', '“收到。继续增加模拟次数。”', 'sumi'],
      ['旁白', '她没有抬头。我的反对只让她把自己计算得更加彻底。', 'sumi']
    ] },
    { afterimage: '候选人从苏弥换成江临，系统的逻辑没有受到任何质疑。', lines: [
      ['苏弥', '“变量替换完成。但你不比我更应该被消耗。”', 'sumi'],
      ['旁白', '她第一次显出恼意，不是因为我否定方案，而是因为我学会了用同一种算法伤害自己。', 'sumi']
    ] },
    { afterimage: '推荐标记消失后，她第一次被允许回答一个没有评分标准的问题。', lines: [
      ['苏弥', '“我想留下那段没用的哼唱。还有……明天早上的卤蛋。”', 'sumi'],
      ['旁白', '她说得像在提交两项低优先级需求，却没有再把它们删除。', 'sumi']
    ] }
  ]);

  wireChoiceAftermath('v4_gw_choice1', 'v43_guwanqing_answer', 'v4_gw_shift_01', [
    { afterimage: '你为她准备了撑得更久的方法，却默认她仍然必须一直撑下去。', lines: [
      ['顾晚晴', '“谢谢。这样我还能多值两个小时。”', 'guwanqing'],
      ['旁白', '她熟练地收下药物，也熟练地把被照顾重新解释成继续工作的燃料。', 'guwanqing']
    ] },
    { afterimage: '你接过她的工作，却仍替她决定了什么时候可以停下。', lines: [
      ['顾晚晴', '“江临，休息不是别人代替我以后发下来的许可。”', 'guwanqing'],
      ['旁白', '她语气温和，拒绝却很清楚。照顾如果没有询问，也会变成另一种接管。', 'guwanqing']
    ] },
    { afterimage: '姓名写进病历的一刻，她终于从“可用资源”变成了需要被询问的人。', lines: [
      ['顾晚晴', '“主诉：总觉得停下来就会被丢下。这个能治吗？”', 'guwanqing'],
      ['我', '“先从允许别人陪你值这一班开始。”', 'guwanqing']
    ] }
  ]);

  wireChoiceAftermath('v4_jy_choice1', 'v43_jiyao_answer', 'v4_jy_boxes_01', [
    { afterimage: '你选择了眼前的她；这很温柔，却仍是一种替她盖章。', lines: [
      ['纪遥', '“如果明天的我和现在不同，你还会说选错了吗？”', 'jiyao'],
      ['旁白', '她没有否认这份喜欢，只把“现在”两个字认真圈了起来。', 'jiyao']
    ] },
    { afterimage: '证据最多的版本胜出，无法举证的人生被悄悄降成了注释。', lines: [
      ['纪遥', '“原来活得真实，也需要准备足够完整的附件。”', 'jiyao'],
      ['旁白', '她笑着记录答案，笔尖却在“伪造”两个字上停了很久。', 'jiyao']
    ] },
    { afterimage: '你只陈述自己记得的她，把最后的作者署名留给了本人。', lines: [
      ['纪遥', '“那你负责作证，我负责以后推翻你的证词。”', 'jiyao'],
      ['旁白', '她把日志的最终状态从“已确认”改成“仍在书写”。', 'jiyao']
    ] }
  ]);

  // 在五条路线的最终抉择前撤掉雨声、音乐和对话框。静默本身是演出，
  // 也是给玩家重新承担选择的时间，而不是额外的故障滤镜。
  const insertSilence = (sourcePrefix, target, id, duration) => {
    const source = Object.entries(nodes).find(([nodeId, node]) => nodeId.startsWith(sourcePrefix) && node.next === target);
    if (!source) return;
    source[1].next = id;
    nodes[id] = { type: 'silence', chapter: nodes[target].chapter, bg: nodes[target].bg, duration, next: target };
  };
  insertSilence('v4_lc_precrisis_', 'v4_lc_choice4', 'v43_lincheng_dead_air', 1550);
  insertSilence('v4_ts_tunnel_', 'v4_ts_choice4', 'v43_tangsha_dead_air', 1300);
  insertSilence('v4_sm_core_', 'v4_sm_choice4', 'v43_sumi_dead_air', 1450);
  insertSilence('v4_gw_crisis_', 'v4_gw_choice4', 'v43_guwanqing_dead_air', 1650);
  insertSilence('v4_jy_core_', 'v4_jy_choice4', 'v43_jiyao_dead_air', 1450);

  story.preload = [
    backgrounds.v4_rooftop_sunset.src,
    backgrounds.v4_studio_day.src,
    backgrounds.v4_studio_signal.src,
    ...Object.values(characters).map(character => character.image)
  ];

  story.start = 'v4_d1_arrival_01';
  story.replayStart = 'v4_route_reentry';
})();
