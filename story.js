(function () {
  'use strict';

  const CHARACTERS = {
    lincheng: {
      name: '林澄', en: 'LIN CHENG', age: 27, role: '深夜节目主持人',
      image: 'assets/char-lincheng-v4.png',
      expressions: { serious: 'assets/char-lincheng-serious-v1.webp', shy: 'assets/char-lincheng-shy-v1.webp', sad: 'assets/char-lincheng-sad-v1.webp', surprised: 'assets/char-lincheng-surprised-v1.webp' },
      color: '#e9c27d', rgb: '233,194,125',
      bio: '声音比夜色更安静的主持人。她似乎从不对任何意外感到惊讶。'
    },
    tangsha: {
      name: '唐砂', en: 'TANG SHA', age: 22, role: '街头摄影师',
      image: 'assets/char-tangsha-v4.png',
      expressions: { serious: 'assets/char-tangsha-serious-v1.webp', shy: 'assets/char-tangsha-shy-v1.webp', sad: 'assets/char-tangsha-sad-v1.webp', surprised: 'assets/char-tangsha-surprised-v1.webp' },
      color: '#f09a69', rgb: '240,154,105',
      bio: '娇小、话快、行动更快。笑起来像闪光灯一样亮，镜头里却总会留下肉眼看不见的东西。'
    },
    sumi: {
      name: '苏弥', en: 'SU MI', age: 25, role: '声音工程师',
      image: 'assets/char-sumi-v4.png',
      expressions: { smile: 'assets/char-sumi-smile-v1.webp', shy: 'assets/char-sumi-shy-v1.webp', focused: 'assets/char-sumi-focused-v1.webp', sad: 'assets/char-sumi-sad-v1.webp' },
      color: '#73cad8', rgb: '115,202,216',
      bio: '常年睡眠不足的无口技术人。嘴上说不相信怪谈，硬盘里却全是异常录音。'
    },
    guwanqing: {
      name: '顾晚晴', en: 'GU WANQING', age: 31, role: '急诊科医生',
      image: 'assets/char-guwanqing-v4.png',
      expressions: { teasing: 'assets/char-guwanqing-teasing-v1.webp', shy: 'assets/char-guwanqing-shy-v1.webp', worried: 'assets/char-guwanqing-worried-v1.webp', serious_open: 'assets/char-guwanqing-serious_open-v1.webp' },
      color: '#d68c9c', rgb: '214,140,156',
      bio: '总是眯眼微笑的温柔年上医生。她救过很多人，却从不谈自己为何害怕凌晨三点。'
    },
    jiyao: {
      name: '纪遥', en: 'JI YAO', age: 24, role: '都市民俗研究者',
      image: 'assets/char-jiyao-v4.png',
      expressions: { serious: 'assets/char-jiyao-serious-v1.webp', mischief: 'assets/char-jiyao-mischief-v1.webp', shy: 'assets/char-jiyao-shy-v1.webp', sad: 'assets/char-jiyao-sad-v1.webp' },
      color: '#b9a3ef', rgb: '185,163,239',
      bio: '眼神灵动、古灵精怪的年轻研究者。她把禁忌当线索，也把玩笑当成掩饰。'
    }
  };

  const BACKGROUNDS = {
    rooftop: { src: 'assets/bg-rooftop.webp', name: '临海市 · FM 00:13 天台' },
    studio: { src: 'assets/bg-studio.webp', name: 'FM 00:13 · 直播间' },
    street: { src: 'assets/bg-street.webp', name: '长汀路 · 24小时便利店' },
    hospital: { src: 'assets/bg-hospital.webp', name: '临海市第二医院 · 急诊层' },
    archive: { src: 'assets/bg-archive.webp', name: '市立档案馆 · 地下音像库' }
  };

  const ENDINGS = {
    lincheng: {
      index: 1, title: '她记得你的声音', subtitle: 'LIN CHENG · SIGNAL 01',
      quote: '“如果明天的我忘了今晚，至少你要记得——我第一次想留下来，是因为你。”',
      bg: 'studio'
    },
    tangsha: {
      index: 2, title: '雨停在快门之前', subtitle: 'TANG SHA · SIGNAL 02',
      quote: '“照片会把未来钉死，但你看着我的时候，我忽然觉得未来也可以重新对焦。”',
      bg: 'street'
    },
    sumi: {
      index: 3, title: '只对你开放的频道', subtitle: 'SU MI · SIGNAL 03',
      quote: '“全世界的噪声都可以滤掉。只有你的声音，我想原样保留。”',
      bg: 'studio'
    },
    guwanqing: {
      index: 4, title: '明日值班表没有她', subtitle: 'GU WANQING · SIGNAL 04',
      quote: '“医生不该让别人替自己冒险……可如果那个人是你，我承认，我会舍不得。”',
      bg: 'hospital'
    },
    jiyao: {
      index: 5, title: '第六卷不存在', subtitle: 'JI YAO · SIGNAL 05',
      quote: '“怪谈最喜欢夺走名字。所以今晚，你要多叫我几次——叫到它再也带不走我。”',
      bg: 'archive'
    }
  };

  const nodes = {};
  const chapter = (no, title) => ({ no, title });

  function addChain(prefix, meta, bg, entries, next) {
    entries.forEach((entry, i) => {
      const id = `${prefix}_${String(i + 1).padStart(2, '0')}`;
      const following = i === entries.length - 1 ? next : `${prefix}_${String(i + 2).padStart(2, '0')}`;
      const data = Array.isArray(entry) ? { speaker: entry[0], text: entry[1], char: entry[2] } : entry;
      nodes[id] = { type: 'line', chapter: meta, bg, next: following, ...data };
    });
  }

  const ch0 = chapter('00', '失真');
  const ch1 = chapter('01', '零点来电');
  const ch2 = chapter('02', '五种答案');

  addChain('intro', ch0, 'rooftop', [
    { speaker: '旁白', char: null, location: true, text: '临海市的雨从傍晚下到零点，把整座城市调成了一段失真的蓝色录音。' },
    ['旁白', '我拖着行李站在旧广播大楼天台，手机上的入职短信只有一行：今晚十一点五十分，别迟到。'],
    ['旁白', '八年没回这座城市。第一份工作，却又把我带回哥哥失踪前待过的地方。'],
    ['？？？', '“{player}？”', 'lincheng'],
    { speaker: '旁白', text: '身后有人叫出我的名字。那声音平稳、清澈，像从很远的夜色里准确落在耳边。', char: 'lincheng' },
    ['林澄', '“我是林澄。FM 00:13 的主持人，也是把你的简历从废纸篓里捡回来的人。”', 'lincheng'],
    ['我', '“所以这是欢迎，还是警告？”', 'lincheng'],
    ['林澄', '“看你今晚能不能撑到节目结束。”', 'lincheng'],
    { speaker: '旁白', text: '她转身时，天线顶端的红灯恰好亮起。短短一瞬，我觉得她早就认识我。', char: 'lincheng' },
    ['林澄', '“进来吧。零点之后，天台不安全。”', 'lincheng']
  ], 'studio_01');

  addChain('studio', ch0, 'studio', [
    { speaker: '旁白', char: null, location: true, text: '直播间比想象中更小。旧调音台亮着一排琥珀色电平灯，像一群半睡半醒的眼睛。' },
    ['林澄', '“节目叫《零点之后》。听众讲失眠、遗憾，偶尔也讲一些……无法核实的东西。”', 'lincheng'],
    ['我', '“工作说明里写的是城市夜谈。”', 'lincheng'],
    ['林澄', '“正规说明里也不会写‘接到未来的电话’。”', 'lincheng'],
    { speaker: '？？？', text: '“哇，新制作人比照片上顺眼。林澄，你没骗我。”', char: 'tangsha' },
    { speaker: '旁白', text: '短发女人从沙发后探出头，胸前的相机撞在桌沿，发出清脆一声。', char: 'tangsha' },
    ['唐砂', '“唐砂，二十二，摄影师。负责给怪谈留下它们不愿意留下的证据。”', 'tangsha'],
    ['我', '“自我介绍连年龄也报？”', 'tangsha'],
    ['唐砂', '“免得你把我当在校生。这里所有人都是成年人，你可以放心紧张。”', 'tangsha'],
    { speaker: '？？？', text: '“能让开吗？你挡住检修口了。”', char: 'sumi' },
    { speaker: '旁白', text: '戴着耳机的女人蹲在设备架前，抬眼看我时，频谱仪正划过一道不自然的白线。', char: 'sumi' },
    ['苏弥', '“苏弥，二十五，声音工程。设备坏了找我；人脑坏了，出门右转。”', 'sumi'],
    ['唐砂', '“她的意思是欢迎。”', 'tangsha'],
    ['苏弥', '“我没有那个意思。”', 'sumi'],
    { speaker: '？？？', text: '“那人脑坏了，至少可以先来急诊。”', char: 'guwanqing' },
    { speaker: '旁白', text: '穿白大褂的女人眯眼笑着放下一袋热饮，先把无糖咖啡递给林澄，再自然地把温热的那杯放到我手边。', char: 'guwanqing' },
    ['顾晚晴', '“顾晚晴，三十一，二院急诊科。每周四做医疗热线。第一次值夜班别喝太冰，胃会抗议。”', 'guwanqing'],
    ['我', '“顾医生对第一次见面的人都这么照顾？”', 'guwanqing'],
    ['顾晚晴', '“只照顾看起来会硬撑的人。”', 'guwanqing'],
    { speaker: '？？？', text: '“五缺一。看来今晚的仪式可以开始了。”', char: 'jiyao' },
    { speaker: '旁白', text: '最后进门的女人抱着一只旧磁带箱，银灰色长辫被雨打湿了一截。', char: 'jiyao' },
    ['纪遥', '“纪遥，二十四，研究都市民俗。放心，我只在学术意义上解剖陌生人。”', 'jiyao'],
    ['我', '“这句话并没有让我放心。”', 'jiyao'],
    ['纪遥', '“很好，警惕性合格。那你有资格知道这家电台真正的规矩了。”', 'jiyao'],
    { speaker: '林澄', text: '“第一，零点十三分后，不接没有来电号码的电话。”', char: 'lincheng' },
    ['苏弥', '“第二，如果听见自己的声音从返听耳机里传来，立刻摘掉耳机。”', 'sumi'],
    ['顾晚晴', '“第三，不管电话里的人说谁会死，都不要独自去确认。”', 'guwanqing'],
    ['唐砂', '“第四，也是最重要的——别摆出那种‘你们在联合整我’的表情。”', 'tangsha'],
    ['纪遥', '“因为前三条都是真的。”', 'jiyao']
  ], 'first_choice');

  nodes.first_choice = {
    type: 'choice', chapter: ch0, bg: 'studio', prompt: '面对她们的“电台规则”，你决定——',
    choices: [
      { label: '认真记下每一条规则', hint: '林澄似乎松了口气', next: 'onair_01', effect: { affinity: { lincheng: 1, guwanqing: 1 } } },
      { label: '先检查设备和电话线路', hint: '苏弥对你的判断表示认可', next: 'onair_01', effect: { affinity: { sumi: 1 } } },
      { label: '问她们以前违反规则的后果', hint: '唐砂与纪遥交换了眼神', next: 'onair_01', effect: { affinity: { tangsha: 1, jiyao: 1 } } }
    ]
  };

  addChain('onair', ch1, 'studio', [
    { speaker: '旁白', char: null, text: '00:00。片头音乐淡出，林澄推起第一路推子。她戴上耳机的瞬间，整个人像融进了夜色。' },
    ['林澄', '“这里是 FM 00:13。无论你正在回家、失眠，还是等待一个不会回来的人——今晚，我们陪你。”', 'lincheng'],
    { speaker: '旁白', text: '接下来的十三分钟平静得近乎刻意。失恋的大学老师、加班的厨师、找不到猫的老人。', char: 'lincheng' },
    ['我', '“第七通结束。广告后接天气？”', 'lincheng'],
    ['林澄', '“嗯。你的节奏比我预想得好。”', 'lincheng'],
    ['唐砂', '“她夸人了。{player}，你值得把今天写进日记。”', 'tangsha'],
    ['林澄', '“唐砂，闭麦。”', 'lincheng'],
    { speaker: '旁白', text: '00:13。墙上的电子钟跳动一下，所有数字同时熄灭。', char: null },
    { speaker: '音效', text: '——叮。', char: null },
    { speaker: '旁白', text: '最右侧那部已经拔掉线路的灰色电话，响了。', char: null },
    ['苏弥', '“线路物理断开。不是外线。”', 'sumi'],
    ['纪遥', '“别接。第一条规则。”', 'jiyao'],
    ['唐砂', '“可它一直在响。”', 'tangsha'],
    ['顾晚晴', '“林澄？”', 'guwanqing'],
    { speaker: '旁白', text: '林澄的手停在听筒上方。她的指尖在发抖，脸上却没有任何意外。', char: 'lincheng' },
    ['我', '“你认识这个铃声。”', 'lincheng'],
    ['林澄', '“八年前，它也响过一次。”', 'lincheng'],
    { speaker: '旁白', text: '八年前。哥哥失踪的那一夜。', char: 'lincheng' },
    ['我', '“接。我来做备份。”', 'lincheng'],
    { speaker: '旁白', text: '我按下录音键。林澄看了我一秒，终于拿起听筒，接入直播线路。', char: 'lincheng' },
    ['陌生女声', '“……听得到吗？”', null],
    ['林澄', '“这里是 FM 00:13。请问怎么称呼你？”', 'lincheng'],
    ['陌生女声', '“明天凌晨三点十七分，临海大桥西引桥会坍塌。”', null],
    ['陌生女声', '“五个人会死。你们当中，有一个人已经听过这通电话。”', null],
    { speaker: '旁白', text: '直播间里没有人呼吸。可电平表上，六道波形同时亮起。', char: null },
    ['陌生女声', '“{player}，别让她一个人去桥上。”', null],
    ['我', '“你知道我是谁？‘她’又是谁？”', null],
    ['陌生女声', '“这次……请你选对。”', null],
    { speaker: '音效', text: '咔哒。电话断了。电子钟恢复，显示 00:14。', char: null },
    ['苏弥', '“录到了。但时间戳是明天——文件创建于二十六小时以后。”', 'sumi'],
    ['唐砂', '“我刚才拍了电话。你们最好看看这个。”', 'tangsha'],
    { speaker: '旁白', text: '她的相机屏幕上，电话旁站着一个模糊人影。墙上的钟不是 00:13，而是 03:17。', char: 'tangsha' },
    ['顾晚晴', '“二院今晚收到一份系统误传的明日急诊预案。伤亡地点，也是临海大桥。”', 'guwanqing'],
    ['纪遥', '“档案馆有一批被封存的‘逆时广播’。每次出现，都要求听众从五个答案里选一个。”', 'jiyao'],
    ['林澄', '“而八年前做错选择的人，是我。”', 'lincheng'],
    ['我', '“那这次就别一个人选。”', 'lincheng'],
    { speaker: '旁白', text: '五个人同时看向我。窗外雷声滚过，录音文件又自己播放了一遍。', char: null },
    ['旁白', '要阻止明晚的事故，我们只有二十六小时。五条线索，五种调查方法，也可能是五个不同的陷阱。', null]
  ], 'route_select');

  // Common-route decisions establish whose signal the player has meaningfully answered.
  // The final route lock only offers heroines with at least one affinity point.
  nodes.onair_29.next = 'reaction_choice';
  nodes.reaction_choice = {
    type: 'choice', chapter: ch1, bg: 'studio', prompt: '电话断线后的第一反应，会被某个人记住——',
    choices: [
      { label: '先确认林澄是否还好', hint: '她一直强装镇定', next: 'onair_30', effect: { affinity: { lincheng: 1 } } },
      { label: '让苏弥立刻封存原始波形', hint: '任何处理都可能破坏证据', next: 'onair_30', effect: { affinity: { sumi: 1 } } },
      { label: '请顾晚晴检查所有人的状态', hint: '异常来电可能造成生理影响', next: 'onair_30', effect: { affinity: { guwanqing: 1 } } }
    ]
  };

  nodes.onair_34.next = 'evidence_choice';
  nodes.evidence_choice = {
    type: 'choice', chapter: ch1, bg: 'studio', prompt: '五条线索同时出现，你决定先抓住——',
    choices: [
      { label: '唐砂照片里的 03:17', hint: '照片也许拍到了未来的现场', next: 'onair_35', effect: { affinity: { tangsha: 1 } } },
      { label: '纪遥所说的“逆时广播”', hint: '档案可能保存着上一轮真相', next: 'onair_35', effect: { affinity: { jiyao: 1 } } },
      { label: '把所有人的证词叠在一起', hint: '不预设唯一答案', next: 'onair_35', effect: { affinity: { lincheng: 1, tangsha: 1, sumi: 1, guwanqing: 1, jiyao: 1 } } }
    ]
  };

  nodes.route_select = {
    type: 'choice', chapter: ch2, bg: 'studio', prompt: '你准备先和谁追查这通“未来来电”？', routeChoice: true,
    choices: [
      { label: '留在电台，追问八年前的真相', hint: '林澄 · 声音的记忆', char: 'lincheng', requires: { affinity: { lincheng: 1 } }, next: 'lincheng_01', effect: { route: 'lincheng', affinity: { lincheng: 2 } } },
      { label: '去雨夜街头，寻找照片中的地点', hint: '唐砂 · 被拍下的未来', char: 'tangsha', requires: { affinity: { tangsha: 1 } }, next: 'tangsha_01', effect: { route: 'tangsha', affinity: { tangsha: 2 } } },
      { label: '进入机房，拆解不可能的时间戳', hint: '苏弥 · 噪声里的坐标', char: 'sumi', requires: { affinity: { sumi: 1 } }, next: 'sumi_01', effect: { route: 'sumi', affinity: { sumi: 2 } } },
      { label: '前往医院，核对明日伤亡预案', hint: '顾晚晴 · 未发生的病历', char: 'guwanqing', requires: { affinity: { guwanqing: 1 } }, next: 'guwanqing_01', effect: { route: 'guwanqing', affinity: { guwanqing: 2 } } },
      { label: '潜入档案库，查找逆时广播', hint: '纪遥 · 不存在的第六卷', char: 'jiyao', requires: { affinity: { jiyao: 1 } }, next: 'jiyao_01', effect: { route: 'jiyao', affinity: { jiyao: 2 } } }
    ]
  };

  addChain('lincheng', chapter('L1', '记得声音的人'), 'studio', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '其他人分头验证线索。直播间只剩我和林澄，雨水沿玻璃缓慢向下。' },
    ['林澄', '“你应该选更容易合作的人。”', 'lincheng'],
    ['我', '“可来电时，只有你不像第一次听见那个声音。”', 'lincheng'],
    ['林澄', '“……因为那是我的声音。更疲惫一些，但我不会认错。”', 'lincheng'],
    ['我', '“未来的你在警告现在？”', 'lincheng'],
    ['林澄', '“八年前也是。那通电话说，你哥哥会在天台消失。它让我在救他和保住节目之间选。”', 'lincheng'],
    ['旁白', '她握紧耳机线，指节苍白。', 'lincheng'],
    ['林澄', '“我选择去找他。可天台上没有人，只有一盘写着我名字的磁带。第二天，他从所有人的记忆里消失了。”', 'lincheng'],
    ['我', '“除了你和我。”', 'lincheng'],
    ['林澄', '“所以我把你招进来。我很自私，对吗？”', 'lincheng']
  ], 'lincheng_choice');

  nodes.lincheng_choice = {
    type: 'choice', chapter: chapter('L1', '记得声音的人'), bg: 'studio', prompt: '你看着她一直隐藏的动摇——',
    choices: [
      { label: '“想让我记住他，不是自私。”', hint: '把手覆在她握紧的手背上', next: 'lincheng_after_01', effect: { affinity: { lincheng: 1 } } },
      { label: '“至少这一次，你先相信我。”', hint: '替她戴上另一侧监听耳机', next: 'lincheng_after_01', effect: { affinity: { lincheng: 1 } } }
    ]
  };

  addChain('lincheng_after', chapter('L1', '记得声音的人'), 'studio', [
    ['旁白', '林澄没有躲开。她掌心的温度比声音更真实。', 'lincheng'],
    ['林澄', '“那就一起听。原始录音最后还有四秒，被苏弥当成静音切掉了。”', 'lincheng'],
    ['旁白', '我们共用一副监听耳机。她的发梢擦过我的脸侧，极轻，却让我错过了第一遍内容。', 'lincheng'],
    ['林澄', '“专心，制作人。”', 'lincheng'],
    ['我', '“你靠得太近了。”', 'lincheng'],
    ['林澄', '“……那是设备问题。”', 'lincheng'],
    ['旁白', '第二遍，噪声深处传来桥梁断裂般的低鸣，随后是她的声音。', 'lincheng'],
    ['未来的林澄', '“不要阻止坍塌。先找到第六个人。”', null],
    ['我', '“电话说会死五个人，可现场其实有六个。”', 'lincheng'],
    ['林澄', '“第六个人不在伤亡名单里。就像你哥哥不在任何人的记忆里。”', 'lincheng'],
    ['旁白', '她忽然抓住我的袖口。调音台所有推子自行推到最高，返听里传来我的声音。', 'lincheng'],
    ['返听中的我', '“林澄，别回头。”', null],
    ['旁白', '可她已经回头。玻璃倒影中，未来的她正站在我们身后，唇形无声地说：明晚见。', 'lincheng'],
    ['林澄', '“{player}，如果明天我忘了今晚……”', 'lincheng'],
    ['我', '“我会让你重新想起来。”', 'lincheng'],
    ['林澄', '“不。先答应我，别忘记你刚才握住我的理由。”', 'lincheng']
  ], 'ending_lincheng');
  nodes.ending_lincheng = { type: 'ending', ending: 'lincheng' };

  addChain('tangsha', chapter('T1', '快门后的明天'), 'street', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '唐砂带我来到照片里的便利店。凌晨一点，粉蓝色霓虹在积水里抖成两条平行的河。' },
    ['唐砂', '“我每次拍到不该存在的东西，都会来这里洗一张即时照片。”', 'tangsha'],
    ['我', '“便利店还能洗照片？”', 'tangsha'],
    ['唐砂', '“店员是我。严格说，是老板欠我钱，所以我有钥匙。”', 'tangsha'],
    ['旁白', '她笑着钻进柜台，动作利落。可相机带一直缠在指尖，暴露出少见的紧张。', 'tangsha'],
    ['唐砂', '“刚才那张照片里不只一个人影。你再看。”', 'tangsha'],
    ['旁白', '她放大玻璃倒影。03:17 的时钟下，我握着她的手；她的另一只手，却按在桥边的爆破开关上。', 'tangsha'],
    ['我', '“你为什么会有爆破开关？”', 'tangsha'],
    ['唐砂', '“因为西引桥明晚不坍塌，凌晨四点经过的化学品车会翻进居民区。死的不是五个人，是五百个。”', 'tangsha'],
    ['我', '“你早就调查过。”', 'tangsha'],
    ['唐砂', '“我爸是桥梁工程师。三个月前，他留下这份检测报告后失踪了。”', 'tangsha']
  ], 'tangsha_choice');

  nodes.tangsha_choice = {
    type: 'choice', chapter: chapter('T1', '快门后的明天'), bg: 'street', prompt: '她把装着证据的存储卡放进你掌心——',
    choices: [
      { label: '“先公开真相，我陪你承担后果。”', hint: '她第一次没有举起相机', next: 'tangsha_after_01', effect: { affinity: { tangsha: 1 } } },
      { label: '“照片里的我握着你，说明你不是一个人。”', hint: '握紧那张仍在显影的照片', next: 'tangsha_after_01', effect: { affinity: { tangsha: 1 } } }
    ]
  };

  addChain('tangsha_after', chapter('T1', '快门后的明天'), 'street', [
    ['唐砂', '“别这么认真。你一认真，我就不知道该往哪儿看了。”', 'tangsha'],
    ['旁白', '她把相机举到脸前，镜头却偏向一旁。耳尖在霓虹下红得明显。', 'tangsha'],
    ['我', '“那就看我。”', 'tangsha'],
    ['音效', '咔嚓。', 'tangsha'],
    ['唐砂', '“糟了。”', 'tangsha'],
    ['旁白', '新照片缓慢吐出。画面里，我们站在明晚的引桥下。雨停了，她靠在我肩上，身后没有坍塌。', 'tangsha'],
    ['我', '“未来变了？”', 'tangsha'],
    ['唐砂', '“不，照片右下角还有日期——这是后天。”', 'tangsha'],
    ['旁白', '后天的我们背后，便利店玻璃映出一个拿相机的男人。唐砂的笑意瞬间消失。', 'tangsha'],
    ['唐砂', '“那是我爸。”', 'tangsha'],
    ['我', '“他还活着。”', 'tangsha'],
    ['唐砂', '“可他胸前挂着你的员工证。”', 'tangsha'],
    ['旁白', '她忽然按住我的手腕，把我的手拉到她相机的快门上。', 'tangsha'],
    ['唐砂', '“明晚你来拍。万一我要做一件很蠢的事，就拍下我，然后把我拽回来。”', 'tangsha'],
    ['我', '“只拍下就够？”', 'tangsha'],
    ['唐砂', '“拽回来以后……可以多握一会儿。照片都已经替你预告了。”', 'tangsha']
  ], 'ending_tangsha');
  nodes.ending_tangsha = { type: 'ending', ending: 'tangsha' };

  addChain('sumi', chapter('S1', '噪声中的坐标'), 'studio', [
    { speaker: '旁白', char: 'sumi', location: true, text: '苏弥把直播间变成临时机房。三块屏幕同时滚动频谱，蓝白光落在她专注的侧脸上。' },
    ['苏弥', '“所谓未来文件，只是元数据异常。元数据可以伪造，波形不会。”', 'sumi'],
    ['我', '“你在说服我，还是说服自己？”', 'sumi'],
    ['苏弥', '“……闭嘴，帮我戴左耳监听。”', 'sumi'],
    ['旁白', '她把一边耳机扣到我耳上，自己戴另一边。距离近得能听见她刻意放轻的呼吸。', 'sumi'],
    ['苏弥', '“底噪每隔零点七秒反相一次，是二进制。解出来是坐标。”', 'sumi'],
    ['我', '“临海大桥？”', 'sumi'],
    ['苏弥', '“不。坐标在我们脚下，地下三层。”', 'sumi'],
    ['旁白', '广播大楼没有地下三层。至少，建筑图纸上没有。', 'sumi'],
    ['苏弥', '“还有一段声纹，匹配你八年前留在寻人热线里的录音。”', 'sumi'],
    ['年少的我', '“如果有人听见，请告诉我哥哥回家。”', null],
    ['旁白', '那是我十五岁的声音。最后一个音节之后，却接着现在的苏弥。', 'sumi'],
    ['录音中的苏弥', '“我找到他了。”', null]
  ], 'sumi_choice');

  nodes.sumi_choice = {
    type: 'choice', chapter: chapter('S1', '噪声中的坐标'), bg: 'studio', prompt: '苏弥摘下耳机，第一次显得不知所措——',
    choices: [
      { label: '“数据不会撒谎，但人可以选择相信谁。”', hint: '告诉她你相信她', next: 'sumi_after_01', effect: { affinity: { sumi: 1 } } },
      { label: '“先别分析。你现在害怕吗？”', hint: '让她承认数据之外的情绪', next: 'sumi_after_01', effect: { affinity: { sumi: 1 } } }
    ]
  };

  addChain('sumi_after', chapter('S1', '噪声中的坐标'), 'archive', [
    { speaker: '旁白', location: true, text: '我们从设备间找到一扇被机柜遮住的铁门。门后向下的楼梯，通往不存在的地下三层。', char: 'sumi' },
    ['苏弥', '“我讨厌这种无法建模的空间。”', 'sumi'],
    ['我', '“你可以抓着我。”', 'sumi'],
    ['苏弥', '“必要的安全连接，不代表其他意思。”', 'sumi'],
    ['旁白', '她说完便握住我的手，手指扣得比“安全连接”更紧。', 'sumi'],
    ['旁白', '楼梯尽头只有一台旧发射机。频率刻度停在 00.13，旁边贴着哥哥的名字。', 'sumi'],
    ['苏弥', '“它正在发送信号。目的地是明天凌晨三点十七分。”', 'sumi'],
    ['我', '“也就是说，未来来电不是从未来打来，而是我们发向未来。”', 'sumi'],
    ['苏弥', '“发送者必须留在这里，直到信号闭环。”', 'sumi'],
    ['旁白', '屏幕弹出用户认证。声纹栏写着：SU MI。', 'sumi'],
    ['我', '“录音里的你说找到他，是因为明晚你会留在这里。”', 'sumi'],
    ['苏弥', '“从逻辑上，这是成功率最高的方案。”', 'sumi'],
    ['我', '“从我的方案里，把‘你一个人留下’删掉。”', 'sumi'],
    ['苏弥', '“那不是可选参数。”', 'sumi'],
    ['我', '“现在是了。”', 'sumi'],
    ['旁白', '她盯了我很久，随后在用户列表里加上我的名字。', 'sumi'],
    ['苏弥', '“频道只允许两个人接入。你要是中途断线，我会生气很久。”', 'sumi'],
    ['我', '“多久？”', 'sumi'],
    ['苏弥', '“至少到我们一起回来的那天。”', 'sumi']
  ], 'ending_sumi');
  nodes.ending_sumi = { type: 'ending', ending: 'sumi' };

  addChain('guwanqing', chapter('G1', '未发生的病历'), 'hospital', [
    { speaker: '旁白', char: 'guwanqing', location: true, text: '凌晨两点，二院急诊层异常安静。顾晚晴刷开值班室，把一份尚未生效的病历调出来。' },
    ['顾晚晴', '“五名伤者，三点二十九分送达。姓名、血型、抢救记录，全都已经填好。”', 'guwanqing'],
    ['我', '“可事故还没发生。”', 'guwanqing'],
    ['顾晚晴', '“更奇怪的是，五个人最后都抢救成功。”', 'guwanqing'],
    ['我', '“电话说他们会死。”', 'guwanqing'],
    ['顾晚晴', '“因为死亡记录属于第六个人。”', 'guwanqing'],
    ['旁白', '她翻到最后一页。死亡时间 03:17，姓名一栏写着：顾晚晴。', 'guwanqing'],
    ['我', '“这不是病历，是交换名单。”', 'guwanqing'],
    ['顾晚晴', '“也可能是最合理的急救决策。一个人换五个人。”', 'guwanqing'],
    ['我', '“你说得太平静了。”', 'guwanqing'],
    ['顾晚晴', '“因为三年前，我弟弟死在那座桥上。急救车迟到了十四分钟。”', 'guwanqing'],
    ['顾晚晴', '“从那以后，我每天都在想，如果那晚有人愿意提前知道——”', 'guwanqing']
  ], 'guwanqing_choice');

  nodes.guwanqing_choice = {
    type: 'choice', chapter: chapter('G1', '未发生的病历'), bg: 'hospital', prompt: '她把自己的死亡记录合上——',
    choices: [
      { label: '“救人的办法，不该以放弃你开始。”', hint: '站到她与那份病历之间', next: 'guwanqing_after_01', effect: { affinity: { guwanqing: 1 } } },
      { label: '“这次提前知道的人不止你一个。”', hint: '把行动计划写在病历背面', next: 'guwanqing_after_01', effect: { affinity: { guwanqing: 1 } } }
    ]
  };

  addChain('guwanqing_after', chapter('G1', '未发生的病历'), 'hospital', [
    ['顾晚晴', '“你很擅长说让医生没法反驳的话。”', 'guwanqing'],
    ['我', '“那顾医生准备听医嘱吗？”', 'guwanqing'],
    ['顾晚晴', '“谁的医嘱？”', 'guwanqing'],
    ['我', '“我的。第一条，不准独自上桥。”', 'guwanqing'],
    ['旁白', '她终于笑了，疲惫却温柔。随后伸手替我整理被雨水打皱的衣领。', 'guwanqing'],
    ['顾晚晴', '“心率有点快。”', 'guwanqing'],
    ['我', '“你碰着我，当然会快。”', 'guwanqing'],
    ['顾晚晴', '“……看来不需要急救。”', 'guwanqing'],
    ['旁白', '电脑忽然刷新。死亡记录的姓名从顾晚晴变成了我的名字。', 'guwanqing'],
    ['顾晚晴', '“不行。”', 'guwanqing'],
    ['旁白', '她抓住我的手，比任何一次脉搏检查都用力。', 'guwanqing'],
    ['顾晚晴', '“它在逼我们互相代替。只要有人愿意牺牲，名字就会转移。”', 'guwanqing'],
    ['我', '“那就谁也不牺牲。让这份病历失效。”', 'guwanqing'],
    ['顾晚晴', '“五名伤者中有一位桥梁养护员。他的随身物品栏写着‘旧广播站钥匙’。”', 'guwanqing'],
    ['我', '“第六个人也许不是伤者，而是在制造这份名单的人。”', 'guwanqing'],
    ['顾晚晴', '“明晚，我会去救那五个人。”', 'guwanqing'],
    ['我', '“我们一起。”', 'guwanqing'],
    ['顾晚晴', '“好。但你要一直在我看得到的地方。”', 'guwanqing'],
    ['旁白', '她没有松手。屏幕上的死亡姓名一阵闪烁，最后变成空白。', 'guwanqing']
  ], 'ending_guwanqing');
  nodes.ending_guwanqing = { type: 'ending', ending: 'guwanqing' };

  addChain('jiyao', chapter('J1', '不存在的第六卷'), 'archive', [
    { speaker: '旁白', char: 'jiyao', location: true, text: '市立档案馆地下音像库没有窗。纪遥用一根发卡打开封条时，熟练得不像第一次。' },
    ['我', '“民俗研究也教开锁？”', 'jiyao'],
    ['纪遥', '“选修课。全名叫‘面对不愿公开的历史时如何保持学术礼貌’。”', 'jiyao'],
    ['旁白', '她从最深处取出五卷录音带，年份分别是 1979、1988、1999、2008 和八年前。', 'jiyao'],
    ['纪遥', '“临海每隔一段时间就会收到未来预警。每次五人获救，一人从现实中消失。”', 'jiyao'],
    ['我', '“我哥哥是上一轮的第六个人。”', 'jiyao'],
    ['纪遥', '“对。而这一次，第六卷已经提前出现。”', 'jiyao'],
    ['旁白', '她指向空出来的位置。架上明明没有磁带，却积着一个长方形灰印，标签写着：纪遥。', 'jiyao'],
    ['我', '“你为什么一点都不惊讶？”', 'jiyao'],
    ['纪遥', '“因为我从小就知道自己会消失。养父在 1999 年的录音里听见过我的名字。”', 'jiyao'],
    ['纪遥', '“我研究这些，不是为了避免结局，是想知道消失以后会去哪儿。”', 'jiyao'],
    ['我', '“现在多一个研究目标：怎么留下来。”', 'jiyao']
  ], 'jiyao_choice');

  nodes.jiyao_choice = {
    type: 'choice', chapter: chapter('J1', '不存在的第六卷'), bg: 'archive', prompt: '她隔着镜片观察你，像在判断一句咒语的真假——',
    choices: [
      { label: '叫她的名字：“纪遥，跟我回去。”', hint: '怪谈会夺走名字，而你要记住它', next: 'jiyao_after_01', effect: { affinity: { jiyao: 1 } } },
      { label: '拿走写着她名字的空标签', hint: '不把她留给不存在的第六卷', next: 'jiyao_after_01', effect: { affinity: { jiyao: 1 } } }
    ]
  };

  addChain('jiyao_after', chapter('J1', '不存在的第六卷'), 'archive', [
    ['纪遥', '“你叫得这么认真，我会误会你舍不得我。”', 'jiyao'],
    ['我', '“不用误会。”', 'jiyao'],
    ['旁白', '她的笑停了一瞬，随即偏过脸，假装去找播放机。', 'jiyao'],
    ['纪遥', '“都市怪谈最怕直球。没有暧昧空间，它们就很难寄生。”', 'jiyao'],
    ['旁白', '我们把五卷磁带同时放进联机设备。第六个卡槽明明空着，转轴却自行旋转。', 'jiyao'],
    ['录音', '“第一轮，五人归来，林渡消失。”', null],
    ['录音', '“第二轮，五人归来，周弦消失。”', null],
    ['旁白', '名字一个个被读出。最后，八年前的录音传出哥哥的声音。', 'jiyao'],
    ['哥哥', '“下一轮，不要再选第六个人。把所有人的名字同时说出来。”', null],
    ['我', '“他找到破坏规则的方法了。”', 'jiyao'],
    ['纪遥', '“代价是必须有人记住此前所有被抹去的人。那个人会承受不属于自己的记忆。”', 'jiyao'],
    ['我', '“我来。”', 'jiyao'],
    ['纪遥', '“你看，怪谈就喜欢你这种逞强的男主角。”', 'jiyao'],
    ['旁白', '她摘下眼镜，额头轻轻抵住我的额头。近得能看清她眼里的不安。', 'jiyao'],
    ['纪遥', '“记忆可以两个人分。民俗学里，这叫共犯关系。”', 'jiyao'],
    ['我', '“听起来不像正式术语。”', 'jiyao'],
    ['纪遥', '“那换一个更通俗的——从明晚开始，不许忘记我。”', 'jiyao'],
    ['旁白', '空卡槽里缓缓吐出一截从未存在的磁带。上面并排写着两个名字：纪遥，和我。', 'jiyao'],
    ['纪遥', '“很好。第六卷现在有两个人，它的规则不够用了。”', 'jiyao']
  ], 'ending_jiyao');
  nodes.ending_jiyao = { type: 'ending', ending: 'jiyao' };

  window.AFTER_ZERO_STORY = {
    title: '零点之后', start: 'intro_01', routeSelect: 'route_select',
    characters: CHARACTERS, backgrounds: BACKGROUNDS, endings: ENDINGS, nodes
  };
})();
