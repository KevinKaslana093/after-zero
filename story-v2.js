(function () {
  'use strict';

  const story = window.AFTER_ZERO_STORY;
  if (!story) throw new Error('AFTER ZERO base story is required before story-v2.js');

  const { nodes } = story;
  const chapter = (no, title) => ({ no, title });
  const addChain = (prefix, meta, bg, entries, next) => {
    entries.forEach((entry, index) => {
      const id = `${prefix}_${String(index + 1).padStart(2, '0')}`;
      const following = index === entries.length - 1 ? next : `${prefix}_${String(index + 2).padStart(2, '0')}`;
      const data = Array.isArray(entry) ? { speaker: entry[0], text: entry[1], char: entry[2] } : entry;
      nodes[id] = { type: 'line', chapter: meta, bg, next: following, ...data };
    });
  };

  const cgScenes = {
    cg_lincheng: ['assets/cg-lincheng-v2.webp', 'FM 00:13 · 只对一人开放的频道'],
    cg_tangsha: ['assets/cg-tangsha-v2.webp', '长汀路 · 雨停在快门之前'],
    cg_sumi: ['assets/cg-sumi-v2.webp', 'FM 00:13 · 双人监听'],
    cg_guwanqing: ['assets/cg-guwanqing-v2.webp', '第二医院 · 晨光诊察'],
    cg_jiyao: ['assets/cg-jiyao-v2.webp', '地下音像库 · 私人证物'],
    cg_true: ['assets/cg-true-v2.webp', 'FM 00:13 天台 · 天亮之后'],
    cg_sea: ['assets/cg-sea-v3.webp', '临海市外海 · 被覆盖的时间线'],
    cg_zero: ['assets/cg-zero-v3.webp', '零点世界 · 永远的 00:13']
  };
  Object.entries(cgScenes).forEach(([key, [src, name]]) => { story.backgrounds[key] = { src, name }; });

  const setCgScene = (prefix, bg) => {
    Object.entries(nodes).forEach(([id, node]) => {
      if (!id.startsWith(`${prefix}_`)) return;
      node.bg = bg;
      node.char = null;
    });
  };

  const heroineEndings = ['lincheng', 'tangsha', 'sumi', 'guwanqing', 'jiyao'];
  story.endings.true = {
    index: 6,
    total: 6,
    routeEnding: false,
    char: 'lincheng',
    image: 'assets/cg-true-v2.webp',
    title: '零点之后，天会亮',
    subtitle: 'TRUE SIGNAL · CHANNEL 06',
    quote: '“{player}，谢谢你，让我重新存在。”',
    bg: 'cg_true'
  };

  Object.entries({
    lincheng: 'cg_lincheng',
    tangsha: 'cg_tangsha',
    sumi: 'cg_sumi',
    guwanqing: 'cg_guwanqing',
    jiyao: 'cg_jiyao'
  }).forEach(([key, bg]) => {
    story.endings[key].bg = bg;
    story.endings[key].image = story.backgrounds[bg].src;
  });

  story.replayStart = 'first_choice';

  // Common-route decisions create a hidden route tendency. The latest focused response
  // resolves equal scores without exposing a heroine-selection menu.
  nodes.reaction_choice.choices[0].effect.flags = { routeBias: 'lincheng' };
  nodes.reaction_choice.choices[1].effect.flags = { routeBias: 'sumi' };
  nodes.reaction_choice.choices[2].effect.flags = { routeBias: 'guwanqing' };
  nodes.evidence_choice.choices[0].effect.flags = { routeBias: 'tangsha' };
  nodes.evidence_choice.choices[1].effect.flags = { routeBias: 'jiyao' };

  story.nodes.route_select = {
    type: 'routeGate', chapter: chapter('02', '信号锁定'), bg: 'studio',
    trueRoute: {
      requires: { endings: heroineEndings }, onceEnding: 'true', next: 'v3_true_awaken_01',
      effect: { route: 'true', flags: { trueSignal: true } }
    },
    routes: {
      lincheng: { next: 'v2_lock_lincheng_01', effect: { route: 'lincheng', affinity: { lincheng: 2 } } },
      tangsha: { next: 'v2_lock_tangsha_01', effect: { route: 'tangsha', affinity: { tangsha: 2 } } },
      sumi: { next: 'v2_lock_sumi_01', effect: { route: 'sumi', affinity: { sumi: 2 } } },
      guwanqing: { next: 'v2_lock_guwanqing_01', effect: { route: 'guwanqing', affinity: { guwanqing: 2 } } },
      jiyao: { next: 'v2_lock_jiyao_01', effect: { route: 'jiyao', affinity: { jiyao: 2 } } }
    }
  };

  addChain('v2_lock_lincheng', chapter('02', '信号锁定'), 'studio', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '其他人准备分头出发时，林澄却按下直播间的门锁。那声轻响，像替刚才所有没有说出口的选择作了结论。' },
    ['林澄', '“你留下。未来来电里有一句话，只有我们两个人听懂了。”', 'lincheng'],
    ['旁白', '她把第二副监听耳机放到我面前。电平表只亮着两路信号。', 'lincheng']
  ], 'v2_lc_open_01');

  addChain('v2_lock_tangsha', chapter('02', '信号锁定'), 'studio', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '唐砂把刚洗出的照片塞进我手里。画面边缘多出一道只有我站的位置才能看见的人影。' },
    ['唐砂', '“别问先去哪。你刚才一直盯着这张照片，说明你已经选了。”', 'tangsha'],
    ['旁白', '她抓起外套冲进雨里。我没有时间再回头看其他线索。', 'tangsha']
  ], 'v2_ts_open_01');

  addChain('v2_lock_sumi', chapter('02', '信号锁定'), 'studio', [
    { speaker: '旁白', char: 'sumi', location: true, text: '苏弥忽然拔下主机的数据线。未来录音的时间戳只在我的耳机接入时继续跳动。' },
    ['苏弥', '“变量已经缩小到两个人。你，还有我。”', 'sumi'],
    ['旁白', '机房门在身后合拢。其他人的声音被隔音层切断，只剩同一段波形在我们之间闪烁。', 'sumi']
  ], 'v2_sm_open_01');

  addChain('v2_lock_guwanqing', chapter('02', '信号锁定'), 'studio', [
    { speaker: '旁白', char: 'guwanqing', location: true, text: '顾晚晴的手机再次响起。明日急诊预案新增了一名没有姓名的陪同者，体征栏却与我完全一致。' },
    ['顾晚晴', '“看来你刚才先担心谁，未来已经替你记录了。”', 'guwanqing'],
    ['旁白', '她向我伸出手，笑容仍然从容。救护车的灯光正停在楼下，像一条不能再错过的路线。', 'guwanqing']
  ], 'v2_gw_open_01');

  addChain('v2_lock_jiyao', chapter('02', '信号锁定'), 'studio', [
    { speaker: '旁白', char: 'jiyao', location: true, text: '纪遥接到档案馆的自动回拨。听筒里没有声音，只有打字机反复敲出我刚才追问的那条禁忌。' },
    ['纪遥', '“问题会选择最认真追问它的人。恭喜，我们现在是共同研究者了。”', 'jiyao'],
    ['旁白', '她把临时通行证扣到我胸前。照片上的名字闪了一下，地下档案库已经开始倒计时。', 'jiyao']
  ], 'v2_jy_open_01');

  addChain('v2_lc_open', chapter('L1', '静音之后'), 'studio', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '其他人带着各自的线索离开，直播间只剩两盏工作灯。雨点撞在隔音玻璃上，像无数听众在门外敲指节。' },
    ['林澄', '“你选了最麻烦的一条线。”', 'lincheng'],
    ['我', '“因为接起电话时，只有你先看了一眼墙上的旧钟。”', 'lincheng'],
    ['林澄', '“观察得太仔细，不一定是优点。”', 'lincheng'],
    ['旁白', '她把最后一期节目的台本扣在桌面上。纸页背面写满了人名，每个名字旁都有一串播出日期。', 'lincheng'],
    ['我', '“这些不是来电听众。”', 'lincheng'],
    ['林澄', '“是被城市忘掉的人。每周三点零七分，我会在天气预报的底噪里念一次。”', 'lincheng'],
    ['我', '“所以你八年都没停止找我哥哥。”', 'lincheng'],
    ['林澄', '“一开始是愧疚。后来……我怕连你也有一天想不起他。”', 'lincheng'],
    ['旁白', '她调出一段没有编号的母带。波形看似平直，放大后却排列成六个人的声纹。第五条属于林澄，第六条属于我。', 'lincheng'],
    ['我', '“未来电话不是单独打给你的。”', 'lincheng'],
    ['林澄', '“它在等我们同时回答。”', 'lincheng'],
    ['旁白', '她戴上监听耳机，却把另一侧留在桌边，没有像平时那样直接递给我。', 'lincheng'],
    ['林澄', '“在继续以前，你应该知道一件事。八年前，是我让你哥哥去了天台。”', 'lincheng'],
    ['我', '“电话让你在救他和保住节目之间选？”', 'lincheng'],
    ['林澄', '“不。电话说，只要他替我回答，所有听众都会活下来。”', 'lincheng'],
    ['旁白', '她的声音仍然稳定，握着推子的手却没有。那只手停在静音键上，像停在八年前同一个决定之前。', 'lincheng'],
    ['林澄', '“现在你还愿意坐到我旁边吗？”', 'lincheng']
  ], 'v2_lc_choice1');

  nodes.v2_lc_choice1 = {
    type: 'choice', chapter: chapter('L1', '静音之后'), bg: 'studio', prompt: '她把最难说出口的部分交给了你——',
    choices: [
      { label: '拉开旁边的椅子：“从头讲，我会听完。”', hint: '不替她减轻，也不让她独自承担', next: 'v2_lc_honest_01', effect: { affinity: { lincheng: 1 }, flags: { lcHonest: true } } },
      { label: '戴上另一侧耳机：“先把他留下的声音找回来。”', hint: '用行动回答她的试探', next: 'v2_lc_care_01', effect: { affinity: { lincheng: 1 }, flags: { lcCare: true } } }
    ]
  };

  addChain('v2_lc_honest', chapter('L1', '静音之后'), 'studio', [
    ['旁白', '我没有碰她的手，只把椅子拉到与她并肩的位置。', 'lincheng'],
    ['我', '“我可能会生气，也可能会怪你。但那应该发生在我听完以后。”', 'lincheng'],
    ['林澄', '“你和他很像。越难听的话，越要对方亲口说。”', 'lincheng'],
    ['旁白', '她第一次没有用主持人的停顿整理情绪。八年前的犹豫、错误和后悔，断断续续落进同一副耳机。', 'lincheng'],
    ['林澄', '“谢谢你没有急着原谅我。”', 'lincheng'],
    ['我', '“也谢谢你终于不替我决定该知道什么。”', 'lincheng']
  ], 'v2_lc_morning_01');

  addChain('v2_lc_care', chapter('L1', '静音之后'), 'studio', [
    ['旁白', '我戴上耳机，把空着的声道推到最大。林澄看了我一眼，悄悄松开静音键。', 'lincheng'],
    ['我', '“责任可以稍后再算。声音正在消失，先救回来。”', 'lincheng'],
    ['林澄', '“你哥哥当时也这么说。他总觉得先做事，就能逃过谈心。”', 'lincheng'],
    ['我', '“那我替他改掉这个坏习惯。找到以后，你要把全部经过告诉我。”', 'lincheng'],
    ['旁白', '她轻轻“嗯”了一声。那不是播音腔，只是一个终于允许自己被帮助的人。', 'lincheng'],
    ['林澄', '“这次我不会删掉任何一秒。”', 'lincheng']
  ], 'v2_lc_morning_01');

  addChain('v2_lc_morning', chapter('L2', '不在台本里的清晨'), 'rooftop', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '凌晨四点，第一轮声纹修复结束。林澄关掉直播间的红灯，带我去天台透气。雨暂时停了，城市像一块还没显影的底片。' },
    ['林澄', '“节目结束以后，我通常不会来这里。”', 'lincheng'],
    ['我', '“因为我哥哥？”', 'lincheng'],
    ['林澄', '“因为这里太安静。安静的时候，会听见那些没能播出去的话。”', 'lincheng'],
    ['旁白', '她从自动贩卖机买了两罐热咖啡，把更烫的那一罐塞给我。', 'lincheng'],
    ['我', '“主持人还负责照顾新制作人？”', 'lincheng'],
    ['林澄', '“仅限试用期。转正以后自己记得吃饭。”', 'lincheng'],
    ['我', '“听起来像长期雇佣。”', 'lincheng'],
    ['林澄', '“你想得太远了。”', 'lincheng'],
    ['旁白', '她说完却没有收回视线。远处信号塔的红灯每隔十三秒亮一次，映在她眼里，像某种克制的邀请。', 'lincheng'],
    ['林澄', '“你离开临海以后，给电台写过三十七封邮件。”', 'lincheng'],
    ['我', '“你都看过？”', 'lincheng'],
    ['林澄', '“每一封。只是那时我不知道该用什么身份回复。”', 'lincheng'],
    ['我', '“现在呢？”', 'lincheng'],
    ['林澄', '“现在我是你的搭档。至少到明晚三点十七分。”', 'lincheng'],
    ['旁白', '她把自己的咖啡罐轻轻碰上我的。金属相撞的声音被天台话筒收了进去，直播间本应关闭的监听灯随之亮起。', 'lincheng'],
    ['未来的林澄', '“如果你们听见这段录音，说明第一种方法失败了。”', null],
    ['未来的林澄', '“不要让我独自留在直播间。也不要让{hero}替我接最后一通电话。”', null],
    ['我', '“未来的你知道我们此刻在一起。”', 'lincheng'],
    ['林澄', '“也知道最后必须有人按下静音。”', 'lincheng'],
    ['旁白', '她快步回到门边，像本能地想把我挡在声音之外。', 'lincheng'],
    ['林澄', '“从现在起，你留在楼下。明晚的直播我一个人做。”', 'lincheng']
  ], 'v2_lc_choice2');

  nodes.v2_lc_choice2 = {
    type: 'choice', chapter: chapter('L2', '不在台本里的清晨'), bg: 'rooftop', prompt: '她又一次试图独自决定结局——',
    choices: [
      { label: '挡住天台门：“你答应过，不再替我决定。”', hint: '要求她把信任落实到选择里', next: 'v2_lc_trust_01', effect: { affinity: { lincheng: 1 }, flags: { lcTrust: true } } },
      { label: '把咖啡罐放进她手里：“先排一场双人直播。”', hint: '用专业方案拆掉她的牺牲冲动', next: 'v2_lc_plan_01', effect: { affinity: { lincheng: 1 }, flags: { lcPlan: true } } }
    ]
  };

  addChain('v2_lc_trust', chapter('L2', '不在台本里的清晨'), 'rooftop', [
    ['我', '“如果你觉得我会害怕，可以说。但别用保护我的名义把我排除。”', 'lincheng'],
    ['林澄', '“我确实害怕。不是怕你做错，是怕你和他一样，做得太对。”', 'lincheng'],
    ['旁白', '我向她伸出手，没有强行拉住。几秒后，她主动把手放了上来。', 'lincheng'],
    ['林澄', '“那你也答应我，任何时候都不准用自己交换别人。”', 'lincheng'],
    ['我', '“成交。你也一样。”', 'lincheng'],
    ['旁白', '这一次，她握住的不是袖口。', 'lincheng']
  ], 'v2_lc_crisis_01');

  addChain('v2_lc_plan', chapter('L2', '不在台本里的清晨'), 'rooftop', [
    ['我', '“一人按静音，是因为系统只有一路主持信号。双主持、双监听，把决定拆成两半。”', 'lincheng'],
    ['林澄', '“设备不支持。”', 'lincheng'],
    ['我', '“所以才需要主持人配合制作人违规。”', 'lincheng'],
    ['旁白', '她看着我画在咖啡罐背面的接线图，嘴角终于出现一点真正的笑。', 'lincheng'],
    ['林澄', '“节目事故报告由你写。”', 'lincheng'],
    ['我', '“如果我们都回来，我写一辈子。”', 'lincheng']
  ], 'v2_lc_crisis_01');

  addChain('v2_lc_crisis', chapter('L3', '请回答我的声音'), 'studio', [
    { speaker: '旁白', char: 'lincheng', location: true, text: '第二夜，03:12。西引桥已经封锁，另外四人守在各自的位置。林澄坐进直播席，我接通了全城最后一段节目。' },
    ['林澄', '“这里是 FM 00:13。今晚不接失眠，也不接告别。”', 'lincheng'],
    ['林澄', '“我们要寻找一些被忘记的人。如果你听见自己的名字，请回答一声。”', 'lincheng'],
    ['旁白', '台本背面的人名被她一个个念出。起初只有电流，随后热线灯从第一路亮到第十三路。', 'lincheng'],
    ['听众', '“我记得周弦。他以前在旧码头修收音机。”', null],
    ['听众', '“林渡是我的高中同桌。为什么我直到现在才想起来？”', null],
    ['旁白', '城市开始归还记忆。墙上的旧钟却逆着走，03:16，03:15，03:14。', 'lincheng'],
    ['苏弥（耳机）', '“信号在回卷。必须有人维持正向时间戳。”', null],
    ['林澄', '“我来。”', 'lincheng'],
    ['我', '“我们来。”', 'lincheng'],
    ['旁白', '我把制作台的第二路推子推到底。两副声纹重叠，旧电话同时响起。', 'lincheng'],
    ['未来的我', '“别接。接电话的人会成为下一次警告的声音。”', null],
    ['林澄', '“原来未来的我一直在阻止你。”', 'lincheng'],
    ['我', '“而未来的我一直在阻止你。它靠我们互相保护，把人一个个留下。”', 'lincheng'],
    ['旁白', '电话响到第十三声。林澄的手停在听筒上方，转而按下免提。', 'lincheng'],
    ['林澄', '“这里没有一个人接听。整座城市都在听。”', 'lincheng'],
    ['旁白', '上百路听众的声音涌进线路。旧钟猛地跳回03:17，远处传来受控爆破的闷响。西引桥空无一人地断开。', 'lincheng'],
    ['唐砂（耳机）', '“化学品车停住了！照片里的伤亡数字在消失！”', null],
    ['旁白', '直播间玻璃上出现未来林澄的倒影。她比现在更疲惫，却在微笑。', 'lincheng'],
    ['未来的林澄', '“这一次，你终于没有关掉任何人的声音。”', null],
    ['林澄', '“包括你的。”', 'lincheng'],
    ['旁白', '倒影散去后，她仍握着我的手。红灯熄灭，掌心的温度却没有随节目结束。', 'lincheng'],
    ['林澄', '“{hero}，搭档关系到这里就结束了。”', 'lincheng'],
    ['我', '“那接下来是什么关系？”', 'lincheng']
  ], 'v2_lc_gate');

  nodes.v2_lc_gate = {
    type: 'gate', chapter: chapter('L3', '请回答我的声音'), bg: 'studio',
    branches: [{ requires: { affinity: { lincheng: 5 } }, next: 'v2_lc_resonance_01' }],
    fallback: 'v2_lc_normal_01'
  };

  addChain('v2_lc_resonance', chapter('L3', '请回答我的声音'), 'studio', [
    ['林澄', '“如果你愿意，是每天节目结束后，我第一个想说晚安的人。”', 'lincheng'],
    ['旁白', '她摘下一侧耳机扣到我耳上。里面没有未来预警，只有她没来得及关掉的心跳。', 'lincheng'],
    ['我', '“这个频道会一直开放吗？”', 'lincheng'],
    ['林澄', '“仅限一位听众。并且不接受退订。”', 'lincheng'],
    ['旁白', '天快亮时，我们重新录制了节目片头。她念完台词，没有示意停机。', 'lincheng'],
    ['林澄', '“还有一句不在台本里。”', 'lincheng'],
    ['林澄', '“欢迎回来。还有……我喜欢你。”', 'lincheng'],
    ['旁白', '我没有按下静音。', 'lincheng']
  ], 'v3_echo_lincheng_01');
  setCgScene('v2_lc_resonance', 'cg_lincheng');

  addChain('v2_lc_normal', chapter('L3', '请回答我的声音'), 'studio', [
    ['林澄', '“是我会认真学习的关系。不是主持人与制作人，也不是愧疚和被愧疚的人。”', 'lincheng'],
    ['我', '“学习期限呢？”', 'lincheng'],
    ['林澄', '“先从明天的早饭开始。”', 'lincheng'],
    ['旁白', '她把第二副耳机留在我的位置上。那是一个尚未说完，却决定继续的回答。', 'lincheng']
  ], 'v3_echo_lincheng_01');

  addChain('v2_ts_open', chapter('T1', '照片不会撒谎'), 'street', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '唐砂带我跑进长汀路的便利店。她的黄色外套沾满雨水，短裤下的小腿溅着泥点，却仍先把相机护进怀里。' },
    ['我', '“先擦头发。相机坏了能修，人感冒了会耽误调查。”', 'tangsha'],
    ['唐砂', '“你加入电台第一天就学会管人了？”', 'tangsha'],
    ['旁白', '她嘴上抱怨，还是接过毛巾，坐到收银台上晃着腿。橙色发梢滴下的水在地砖上积成小小的倒计时。', 'tangsha'],
    ['唐砂', '“我爸说摄影有三条规矩：别让镜头替你判断，别拿死亡换独家，别拍不愿被记住的人。”', 'tangsha'],
    ['我', '“你违反过哪条？”', 'tangsha'],
    ['唐砂', '“全部。所以他失踪前最后一句话是‘别再拍未来’。”', 'tangsha'],
    ['旁白', '她打开暗房门。墙上挂着数百张同一座西引桥，日期从三个月前一直延伸到明天。', 'tangsha'],
    ['我', '“桥每天都在照片里坍塌？”', 'tangsha'],
    ['唐砂', '“方式不同。有时断梁，有时货车爆炸，有时什么都没发生，但整片居民区空了。”', 'tangsha'],
    ['旁白', '最新一张照片中，03:17的桥面上站着六个人。五人面朝镜头，第六人的脸被闪光完全烧白。', 'tangsha'],
    ['唐砂', '“我试过放大。每放大一次，就会忘记我爸的一件事。”', 'tangsha'],
    ['我', '“所以你不敢确认第六个人是不是他。”', 'tangsha'],
    ['唐砂', '“不是不敢。”', 'tangsha'],
    ['旁白', '她按住相片边缘，指尖用力得发白。平日总带笑的眼睛第一次没有躲进取景框后。', 'tangsha'],
    ['唐砂', '“我怕确认以后，为了把他带回来，会愿意让照片里的五个人去死。”', 'tangsha'],
    ['我', '“那就别一个人看。”', 'tangsha'],
    ['唐砂', '“你知道一起看意味着什么吗？照片也会开始拿走你的记忆。”', 'tangsha']
  ], 'v2_ts_choice1');

  nodes.v2_ts_choice1 = {
    type: 'choice', chapter: chapter('T1', '照片不会撒谎'), bg: 'street', prompt: '显影液中的第六张脸正在浮现——',
    choices: [
      { label: '和她一起按住照片：“记忆一人分一半。”', hint: '共同承担照片索取的代价', next: 'v2_ts_share_01', effect: { affinity: { tangsha: 1 }, flags: { tsShare: true } } },
      { label: '拿起她父亲的检测报告：“先用现实证据找他。”', hint: '不让未来影像决定现在', next: 'v2_ts_evidence_01', effect: { affinity: { tangsha: 1 }, flags: { tsEvidence: true } } }
    ]
  };

  addChain('v2_ts_share', chapter('T1', '照片不会撒谎'), 'street', [
    ['旁白', '我们的手指同时压住相纸。刺眼的白光闪过，我脑中关于哥哥的一段声音突然变得模糊。', 'tangsha'],
    ['唐砂', '“松手！我没让你真的陪我忘。”', 'tangsha'],
    ['我', '“可我看见了。第六个人胸前挂着FM 00:13的旧员工证。”', 'tangsha'],
    ['唐砂', '“我也想起一件事。我爸失踪前，去过电台的旧发射站。”', 'tangsha'],
    ['旁白', '她把我的手从相纸上拽下来，却没有立刻放开。', 'tangsha'],
    ['唐砂', '“以后不准擅自陪我冒险。至少要等我数三二一。”', 'tangsha']
  ], 'v2_ts_dawn_01');

  addChain('v2_ts_evidence', chapter('T1', '照片不会撒谎'), 'street', [
    ['旁白', '我把照片翻扣在桌面，只展开桥梁检测报告。唐砂怔了一下，呼吸逐渐平稳。', 'tangsha'],
    ['我', '“未来能改照片，但改不了螺栓的疲劳数据。”', 'tangsha'],
    ['唐砂', '“报告最后有一行坐标。旧发射站……我以前以为是测量基准点。”', 'tangsha'],
    ['我', '“你爸不是消失在桥上。他是追着信号去了电台。”', 'tangsha'],
    ['旁白', '她把相机从胸前放下，第一次用自己的眼睛重新看那面照片墙。', 'tangsha'],
    ['唐砂', '“原来不拍，也能找到东西。”', 'tangsha']
  ], 'v2_ts_dawn_01');

  addChain('v2_ts_dawn', chapter('T2', '取景框以外'), 'street', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '天色发白时，我们沿着引桥下的旧街寻找发射站入口。暴雨变成细雾，唐砂踩过每一个水洼，像故意把沉重的话题甩在身后。' },
    ['唐砂', '“站好，难得有一个不塌的清晨。”', 'tangsha'],
    ['我', '“你又拍未来？”', 'tangsha'],
    ['唐砂', '“这次拍现在。给新搭档留张遗照——疼！”', 'tangsha'],
    ['旁白', '我用卷起的检测报告轻敲她额头。她笑着后退，镜头却一直对着我。', 'tangsha'],
    ['我', '“为什么总隔着相机看人？”', 'tangsha'],
    ['唐砂', '“因为取景框有边。只要控制好边界，就不会把谁看得太重要。”', 'tangsha'],
    ['我', '“你爸失踪以后，你就没再给自己拍过照片。”', 'tangsha'],
    ['唐砂', '“摄影师不需要入镜。”', 'tangsha'],
    ['我', '“可你未来的照片里，每一张都有我和你。”', 'tangsha'],
    ['旁白', '她脚下一滑。我抓住她手腕，把她从湿漉漉的护栏边拉回来。相机在两人之间晃荡，自动按下一次快门。', 'tangsha'],
    ['唐砂', '“……这张不算。我没构图。”', 'tangsha'],
    ['我', '“我觉得挺好。”', 'tangsha'],
    ['旁白', '屏幕里，她撞在我肩前，表情不是面对镜头时设计好的笑，而是来不及藏起来的慌乱。', 'tangsha'],
    ['唐砂', '“删掉。”', 'tangsha'],
    ['我', '“第三条规矩，不能拍不愿被记住的人。那你真的不愿意？”', 'tangsha'],
    ['旁白', '她沉默许久，把相机抢回去，却只是给照片标了一颗星。', 'tangsha'],
    ['唐砂', '“暂存。等明晚以后再决定。”', 'tangsha'],
    ['旁白', '桥墩背面出现一道被广告牌挡住的铁门。门锁旁贴着她父亲惯用的橙色测量标。', 'tangsha'],
    ['唐砂', '“他来过。标记是新的，最多三天。”', 'tangsha'],
    ['旁白', '门内的旧监控正在循环播放明晚桥面。画面里的唐砂站在爆破开关前，而我从她背后伸手。', 'tangsha'],
    ['监控中的唐砂', '“别相信照片。相信按下快门以前的人。”', null]
  ], 'v2_ts_choice2');

  nodes.v2_ts_choice2 = {
    type: 'choice', chapter: chapter('T2', '取景框以外'), bg: 'street', prompt: '监控要求由一个人掌握明晚的爆破权——',
    choices: [
      { label: '把遥控器交给她：“我相信按下快门以前的你。”', hint: '承认她有选择未来的能力', next: 'v2_ts_trust_01', effect: { affinity: { tangsha: 1 }, flags: { tsTrust: true } } },
      { label: '拆下双重确认模块：“我们各拿一半权限。”', hint: '让信任拥有可以执行的结构', next: 'v2_ts_dual_01', effect: { affinity: { tangsha: 1 }, flags: { tsDual: true } } }
    ]
  };

  addChain('v2_ts_trust', chapter('T2', '取景框以外'), 'street', [
    ['旁白', '遥控器落进她掌心。唐砂没有像往常那样用玩笑接住。', 'tangsha'],
    ['唐砂', '“如果照片显示按下去会失去我爸呢？”', 'tangsha'],
    ['我', '“那就先看你。你比照片更了解自己会怎么选。”', 'tangsha'],
    ['旁白', '她把遥控器贴在心口，抬头直直看我，没有镜头作为遮挡。', 'tangsha'],
    ['唐砂', '“你这样信人，很危险。”', 'tangsha'],
    ['我', '“所以明晚你负责把我拽回来。”', 'tangsha']
  ], 'v2_ts_crisis_01');

  addChain('v2_ts_dual', chapter('T2', '取景框以外'), 'street', [
    ['旁白', '我把确认模块拆成两枚钥匙。必须在三秒内同时转动，爆破指令才会生效。', 'tangsha'],
    ['唐砂', '“很像情侣款挂件，就是审美差了点。”', 'tangsha'],
    ['我', '“你可以给它拍得好看一点。”', 'tangsha'],
    ['唐砂', '“照片会骗人。实物我先保管。”', 'tangsha'],
    ['旁白', '她把其中一枚钥匙系到我的腕带上，动作认真得像完成某种约定。', 'tangsha'],
    ['唐砂', '“三秒之内，不准放开我。”', 'tangsha']
  ], 'v2_ts_crisis_01');

  addChain('v2_ts_crisis', chapter('T3', '雨停在快门之前'), 'street', [
    { speaker: '旁白', char: 'tangsha', location: true, text: '第二夜03:14，西引桥完成疏散。化学品车却无视封锁冲向桥头，驾驶室里坐着照片中本该失踪的男人。' },
    ['唐砂', '“爸……”', 'tangsha'],
    ['唐父（无线电）', '“别靠近我。信号需要一个驾驶员把货车带过断点。”', null],
    ['我', '“他不是要撞桥，是想把爆炸带到无人区。”', 'tangsha'],
    ['唐父（无线电）', '“小砂，照片只给你看代价，从来不告诉你还有别的方法。”', null],
    ['旁白', '唐砂举起相机。取景框里出现两种未来：按下爆破，父亲和车一起坠落；不按，居民区被火焰吞没。', 'tangsha'],
    ['唐砂', '“它又只给我两个烂选项。”', 'tangsha'],
    ['我', '“那就拍取景框外面。”', 'tangsha'],
    ['旁白', '我指向桥下的检修坡道。检测报告标明那里能承受货车重量，只需提前炸开侧向护栏。', 'tangsha'],
    ['唐砂', '“改变爆破点需要近距离重新布线。”', 'tangsha'],
    ['我', '“我去。”', 'tangsha'],
    ['唐砂', '“你敢把我留在安全线后，我就拍一整套你的丑照放进电台官网。”', 'tangsha'],
    ['旁白', '她把相机塞给我，自己先翻过护栏。裸露的小腿被金属边擦出一道血痕，她连脚步都没停。', 'tangsha'],
    ['我', '“唐砂！”', 'tangsha'],
    ['唐砂', '“三、二——跟上！”', 'tangsha'],
    ['旁白', '我们在雨中跑到侧梁，一人接一根线。货车的灯光逼近，她的手却比任何一次按快门都稳。', 'tangsha'],
    ['唐砂', '“{hero}，如果这次照片还是错的呢？”', 'tangsha'],
    ['我', '“那就让现在纠正它。”', 'tangsha'],
    ['两人', '“一。”', null],
    ['旁白', '侧梁爆开。货车沿检修坡道冲进空旷河滩，消防车立即包围。主桥在下一秒断裂，桥面上没有任何人。', 'tangsha'],
    ['唐父（无线电）', '“拍到了吗？”', null],
    ['旁白', '我按下快门。照片里不是灾难，而是唐砂背对坍塌的桥，迎着我跑来。', 'tangsha'],
    ['唐砂', '“笨蛋，谁让你拍我哭的！”', 'tangsha'],
    ['我', '“第三条规矩。你不愿意被记住吗？”', 'tangsha'],
    ['旁白', '她撞进我怀里，湿透的额头抵着肩膀，手却牢牢攥着那张刚刚显影的现在。', 'tangsha']
  ], 'v2_ts_gate');

  nodes.v2_ts_gate = {
    type: 'gate', chapter: chapter('T3', '雨停在快门之前'), bg: 'street',
    branches: [{ requires: { affinity: { tangsha: 5 } }, next: 'v2_ts_resonance_01' }],
    fallback: 'v2_ts_normal_01'
  };

  addChain('v2_ts_resonance', chapter('T3', '雨停在快门之前'), 'street', [
    ['唐砂', '“我愿意。不过以后照片里得有你。”', 'tangsha'],
    ['我', '“摄影师怎么入镜？”', 'tangsha'],
    ['唐砂', '“定时，自拍，或者把相机交给值得相信的人。”', 'tangsha'],
    ['旁白', '她踮起脚，把相机举到我们面前。取景框里，她的笑还有泪，我的外套狼狈得不像男主角。', 'tangsha'],
    ['唐砂', '“这才叫没有修过的真结局。”', 'tangsha'],
    ['音效', '咔嚓。', 'tangsha'],
    ['旁白', '相纸上没有日期，也没有灾难预告。只有她贴近我，在雨真正停下前吻上来的瞬间。', 'tangsha'],
    ['唐砂', '“这张不准删。还有，我喜欢你——这句也不准当成未来预告。”', 'tangsha']
  ], 'v3_echo_tangsha_01');
  setCgScene('v2_ts_resonance', 'cg_tangsha');

  addChain('v2_ts_normal', chapter('T3', '雨停在快门之前'), 'street', [
    ['唐砂', '“愿意。但这张先由我保管，等我学会不靠未来决定喜欢谁。”', 'tangsha'],
    ['我', '“需要多久？”', 'tangsha'],
    ['唐砂', '“从陪我去医院处理伤口开始计时。”', 'tangsha'],
    ['旁白', '她把相机挂到我胸前，自己牵住了我的手。这一次，我们都没有提前看下一张照片。', 'tangsha']
  ], 'v3_echo_tangsha_01');

  addChain('v2_sm_open', chapter('S1', '无法建模的声音'), 'studio', [
    { speaker: '旁白', char: 'sumi', location: true, text: '苏弥把直播间改成临时机房。三块屏幕滚动着频谱，她缩在宽大的黑色连帽外套里，只露出一双因为缺觉而发红的眼睛。' },
    ['苏弥', '“先声明，我不研究超自然。我只处理尚未被正确命名的物理现象。”', 'sumi'],
    ['我', '“例如来自明天的电话？”', 'sumi'],
    ['苏弥', '“例如时间戳错误、声纹伪造和集体判断力下降。”', 'sumi'],
    ['旁白', '她递给我左耳监听，自己戴右耳。耳机线短得过分，我们只能肩并肩坐在同一把转椅上。', 'sumi'],
    ['苏弥', '“不要乱动。线路很脆弱。”', 'sumi'],
    ['我', '“你说的是耳机线？”', 'sumi'],
    ['苏弥', '“全部。”', 'sumi'],
    ['旁白', '底噪每零点七秒反相一次。她把波峰翻译成坐标，又把坐标映射成大楼结构图。光标最终停在不存在的地下三层。', 'sumi'],
    ['苏弥', '“还有第二层编码。不是二进制，是呼吸间隔。”', 'sumi'],
    ['我', '“谁的呼吸？”', 'sumi'],
    ['旁白', '她单独播放声道。少年时期的我在寻人热线里一遍遍说哥哥的名字，背景中有另一个孩子轻轻数拍。', 'sumi'],
    ['苏弥', '“是我。八年前，我在电台做听力康复。”', 'sumi'],
    ['我', '“我们见过？”', 'sumi'],
    ['苏弥', '“隔着一面玻璃。你没有看见我，但你的声音让我第一次分辨出人声和噪声的边界。”', 'sumi'],
    ['旁白', '她调低音量，像后悔让这句话通过了审核。', 'sumi'],
    ['苏弥', '“所以我来这里工作。不是为了你。是为了复现有效样本。”', 'sumi'],
    ['我', '“复现了八年？”', 'sumi'],
    ['苏弥', '“……实验周期偏长。”', 'sumi'],
    ['旁白', '屏幕突然弹出一行来自明天的字幕：SU MI 已接入，另一名用户待定。', 'sumi']
  ], 'v2_sm_choice1');

  nodes.v2_sm_choice1 = {
    type: 'choice', chapter: chapter('S1', '无法建模的声音'), bg: 'studio', prompt: '她把“另一名用户”的输入框留给你——',
    choices: [
      { label: '输入自己的名字：“把我加入模型。”', hint: '以她熟悉的方式表达信任', next: 'v2_sm_model_01', effect: { affinity: { sumi: 1 }, flags: { smModel: true } } },
      { label: '暂时合上键盘：“先告诉我，你是不是害怕。”', hint: '让情绪获得数据之外的位置', next: 'v2_sm_emotion_01', effect: { affinity: { sumi: 1 }, flags: { smEmotion: true } } }
    ]
  };

  addChain('v2_sm_model', chapter('S1', '无法建模的声音'), 'studio', [
    ['旁白', '我的名字出现在她旁边。系统没有报错，反而补出一条重合度百分之九十七的声纹。', 'sumi'],
    ['苏弥', '“你不问接入风险？”', 'sumi'],
    ['我', '“风险报告由工程师负责。”', 'sumi'],
    ['苏弥', '“可能失去时间感、短期记忆，或者被困在闭环里。”', 'sumi'],
    ['我', '“那就把退出条件也写成两个人。”', 'sumi'],
    ['旁白', '她盯着并排的名字看了很久，保存配置时罕见地按错了一次键。', 'sumi']
  ], 'v2_sm_descent_01');

  addChain('v2_sm_emotion', chapter('S1', '无法建模的声音'), 'studio', [
    ['苏弥', '“害怕是交感神经反应，不构成决策依据。”', 'sumi'],
    ['我', '“可你把光标停在取消键上三分钟了。”', 'sumi'],
    ['旁白', '她摘下耳机。没有电子底噪以后，我听见她真实而急促的呼吸。', 'sumi'],
    ['苏弥', '“我怕听见未来的自己说，你没有回来。”', 'sumi'],
    ['我', '“那就把我加入频道。我们一起回来，给她一个错误答案。”', 'sumi'],
    ['旁白', '她重新戴好耳机，把另一侧轻轻按紧在我耳边。', 'sumi']
  ], 'v2_sm_descent_01');

  addChain('v2_sm_descent', chapter('S2', '地下三层的午睡'), 'archive', [
    { speaker: '旁白', char: 'sumi', location: true, text: '设备间后的铁门通向地下。楼梯比建筑高度更深，每走十三级，手机时间就倒退一分钟。苏弥一边记录，一边越来越靠近我的手臂。' },
    ['苏弥', '“这是为了共享惯性参照。”', 'sumi'],
    ['我', '“可以直接说怕黑。”', 'sumi'],
    ['苏弥', '“我不怕黑。我讨厌没有底噪的空间。”', 'sumi'],
    ['旁白', '地下三层安静得能听见血液流过耳膜。她的步伐开始失去节奏，我打开手机里保存的电台片头。', 'sumi'],
    ['林澄的录音', '“无论你正在回家、失眠，还是等待一个不会回来的人——”', null],
    ['苏弥', '“循环播放。音量百分之十二。”', 'sumi'],
    ['我', '“收到。”', 'sumi'],
    ['旁白', '声音重新建立方向。她没有松手，直到我们看见走廊尽头那台仍在运转的旧发射机。', 'sumi'],
    ['苏弥', '“频率00.13，输出端指向明天。它不是接收未来，是把现在的一部分延迟发送。”', 'sumi'],
    ['我', '“被延迟的那部分是什么？”', 'sumi'],
    ['苏弥', '“人的声纹，以及与声纹绑定的记忆。”', 'sumi'],
    ['旁白', '机柜旁堆着八年份的能量饮料罐和维修记录。最后一条签名属于她，日期却是明天。', 'sumi'],
    ['我', '“未来的你一直在这里维护它。”', 'sumi'],
    ['苏弥', '“如果闭环成立，我从明晚起会被困在地下，持续向过去发送警告。”', 'sumi'],
    ['我', '“所以现在就关掉。”', 'sumi'],
    ['苏弥', '“关掉会失去所有预警，桥上五人无法获救。”', 'sumi'],
    ['旁白', '她说完坐到机柜边，像电量耗尽一样蜷起腿。连续工作三十小时终于压过了意志。', 'sumi'],
    ['苏弥', '“给我七分钟。REM前短睡眠能恢复判断。”', 'sumi'],
    ['我', '“这里？”', 'sumi'],
    ['苏弥', '“你提供稳定声源。”', 'sumi'],
    ['旁白', '她把头靠上我的肩，耳机仍一人一侧。七分钟里，发射机播放着未来的风雨，她的呼吸逐渐与我的心跳同拍。', 'sumi'],
    ['苏弥', '“……别停。”', 'sumi'],
    ['我', '“我没说话。”', 'sumi'],
    ['苏弥', '“心跳。”', 'sumi']
  ], 'v2_sm_choice2');

  nodes.v2_sm_choice2 = {
    type: 'choice', chapter: chapter('S2', '地下三层的午睡'), bg: 'archive', prompt: '七分钟到了，她仍紧紧抓着你的袖口——',
    choices: [
      { label: '让她多睡一分钟，继续数自己的心跳', hint: '给她从未允许自己的依靠', next: 'v2_sm_rest_01', effect: { affinity: { sumi: 1 }, flags: { smRest: true } } },
      { label: '轻声叫醒她，一起改写发射机程序', hint: '把依赖变成并肩完成的方案', next: 'v2_sm_pair_01', effect: { affinity: { sumi: 1 }, flags: { smPair: true } } }
    ]
  };

  addChain('v2_sm_rest', chapter('S2', '地下三层的午睡'), 'archive', [
    ['旁白', '我没有移动。第八分钟，她睁开眼，先确认我的脉搏还在，再假装只是查看手表。', 'sumi'],
    ['苏弥', '“你违反了七分钟约定。”', 'sumi'],
    ['我', '“误差在可接受范围内。”', 'sumi'],
    ['苏弥', '“一分钟足以改变很多数据。”', 'sumi'],
    ['我', '“例如？”', 'sumi'],
    ['苏弥', '“例如我现在不想让你离开监听范围。”', 'sumi']
  ], 'v2_sm_crisis_01');

  addChain('v2_sm_pair', chapter('S2', '地下三层的午睡'), 'archive', [
    ['旁白', '她醒来后没有从我肩上立刻离开，而是保持那个姿势打开终端。', 'sumi'],
    ['苏弥', '“把单用户持续发送改成双用户交替脉冲。每个人只承担一半记忆延迟。”', 'sumi'],
    ['我', '“两个人必须一直保持同步？”', 'sumi'],
    ['苏弥', '“理论上，是。”', 'sumi'],
    ['我', '“听起来不像坏条件。”', 'sumi'],
    ['旁白', '她的敲键速度停顿半秒，然后把同步期限从十三分钟改成“直到手动解除”。', 'sumi']
  ], 'v2_sm_crisis_01');

  addChain('v2_sm_crisis', chapter('S3', '双人频道'), 'archive', [
    { speaker: '旁白', char: 'sumi', location: true, text: '第二夜03:15，地下三层开始坍缩。墙壁后的时间像磁带一样被卷进发射机，我们同时接入双用户频道。' },
    ['苏弥', '“声纹同步百分之八十一。低于九十，信号会把我们识别成两个牺牲者。”', 'sumi'],
    ['我', '“怎样提高？”', 'sumi'],
    ['苏弥', '“说同一句话，必须完全同拍。”', 'sumi'],
    ['旁白', '屏幕给出句子：不要让第六个人回答。我们试了三次，总有一个音节错开。', 'sumi'],
    ['苏弥', '“你的‘六’比标准长零点零四秒。”', 'sumi'],
    ['我', '“你紧张时呼吸会提前。”', 'sumi'],
    ['苏弥', '“无关变量。”', 'sumi'],
    ['旁白', '天花板裂开，未来的噪声涌入。无数版本的苏弥同时说着“我留下”，几乎淹没她现在的声音。', 'sumi'],
    ['未来的苏弥们', '“单用户方案成功率更高。”', null],
    ['苏弥', '“它们是对的。”', 'sumi'],
    ['我', '“但不是你想要的。”', 'sumi'],
    ['苏弥', '“想要不属于工程参数。”', 'sumi'],
    ['我', '“那就新增参数。”', 'sumi'],
    ['旁白', '我握住她冰冷的手，把它按在自己胸口。她先是僵住，随后闭上眼，跟着心跳重新呼吸。', 'sumi'],
    ['我', '“不用跟文字同步。跟我。”', 'sumi'],
    ['苏弥', '“……收到。”', 'sumi'],
    ['两人', '“不要让第六个人回答。”', null],
    ['旁白', '同步率跳到百分之一百。双重声纹穿过发射机，旧电话的线路在所有时间点同时断开。', 'sumi'],
    ['林澄（耳机）', '“桥面已清空，时间恢复正向！”', null],
    ['旁白', '地下三层开始消失。苏弥却没有松开连接，拖着我冲向楼梯。', 'sumi'],
    ['苏弥', '“保持心率。不要死，不要晕，也不要突然告白。”', 'sumi'],
    ['我', '“最后一条为什么？”', 'sumi'],
    ['苏弥', '“会造成不可预测波动。”', 'sumi'],
    ['旁白', '我们跃出铁门时，整段楼梯在身后变成一阵安静的白噪声。她伏在我身上喘气，手掌仍贴着胸口。', 'sumi']
  ], 'v2_sm_gate');

  nodes.v2_sm_gate = {
    type: 'gate', chapter: chapter('S3', '双人频道'), bg: 'studio',
    branches: [{ requires: { affinity: { sumi: 5 } }, next: 'v2_sm_resonance_01' }],
    fallback: 'v2_sm_normal_01'
  };

  addChain('v2_sm_resonance', chapter('S3', '双人频道'), 'studio', [
    ['苏弥', '“现在可以了。”', 'sumi'],
    ['我', '“可以什么？”', 'sumi'],
    ['苏弥', '“造成不可预测波动。”', 'sumi'],
    ['旁白', '她把耳机挂到我颈间，额头轻轻碰上我的。声音很小，却没有任何噪声可以误认。', 'sumi'],
    ['苏弥', '“我喜欢你的声音，也喜欢声音停止以后，你还在旁边。”', 'sumi'],
    ['我', '“需要记录成实验结论吗？”', 'sumi'],
    ['苏弥', '“需要重复验证。频率建议每天一次。”', 'sumi'],
    ['旁白', '她说完便靠回我肩上，安心睡着。我们的频道仍保持连接，只是这一次，不再通往未来。', 'sumi']
  ], 'v3_echo_sumi_01');
  setCgScene('v2_sm_resonance', 'cg_sumi');

  addChain('v2_sm_normal', chapter('S3', '双人频道'), 'studio', [
    ['苏弥', '“等心率恢复以后，我有一个长期同步实验需要你参加。”', 'sumi'],
    ['我', '“有退出选项吗？”', 'sumi'],
    ['苏弥', '“暂未实现。”', 'sumi'],
    ['旁白', '她把另一侧监听耳机留给我。没有告白，但频道已经不再允许第三个人接入。', 'sumi']
  ], 'v3_echo_sumi_01');

  addChain('v2_gw_open', chapter('G1', '明日病历'), 'hospital', [
    { speaker: '旁白', char: 'guwanqing', location: true, text: '凌晨两点，二院急诊层反常地安静。顾晚晴换着一件白大褂快步穿过走廊，眯起的眼睛仍带笑，步伐却比救护车警报更急。' },
    ['顾晚晴', '“跟紧一点。凌晨的医院很容易走错楼层，尤其是还没发生的那一层。”', 'guwanqing'],
    ['我', '“医院也有怪谈规则？”', 'guwanqing'],
    ['顾晚晴', '“医生一般叫它夜班经验。”', 'guwanqing'],
    ['旁白', '她刷开值班室，电脑里已经生成五名伤者的完整病历。姓名、血型、抢救过程全部存在，入院时间却是明天03:29。', 'guwanqing'],
    ['我', '“五个人都抢救成功。”', 'guwanqing'],
    ['顾晚晴', '“所以电话里说的死亡不属于他们。”', 'guwanqing'],
    ['旁白', '最后一页是一张死亡记录。03:17，姓名顾晚晴，死因一栏写着“自愿替代”。', 'guwanqing'],
    ['我', '“你早就看过了。”', 'guwanqing'],
    ['顾晚晴', '“三天前开始，每次删除都会重新出现。打印机会在没有纸的时候把它吐出来。”', 'guwanqing'],
    ['我', '“所以你加入调查，是准备照着执行？”', 'guwanqing'],
    ['顾晚晴', '“一个人换五个人，从急救资源分配来看——”', 'guwanqing'],
    ['我', '“这不是资源。上面写的是你的名字。”', 'guwanqing'],
    ['旁白', '她的笑没有消失，只是变得很薄。指尖在死亡时间上停留，像在确认一位陌生患者的脉搏。', 'guwanqing'],
    ['顾晚晴', '“三年前，我弟弟死在西引桥。救护车晚到十四分钟。”', 'guwanqing'],
    ['顾晚晴', '“我后来救过很多人，还是会梦见那十四分钟。如果一张病历能把它还给我——”', 'guwanqing'],
    ['我', '“它没有还给你弟弟，只是在利用医生最难拒绝的条件。”', 'guwanqing'],
    ['旁白', '她终于抬头。那双总像藏在笑意后的眼睛微微睁开，里面没有温柔的余裕。', 'guwanqing'],
    ['顾晚晴', '“那你准备怎么阻止一个知道代价、仍然愿意签字的成年人？”', 'guwanqing']
  ], 'v2_gw_choice1');

  nodes.v2_gw_choice1 = {
    type: 'choice', chapter: chapter('G1', '明日病历'), bg: 'hospital', prompt: '她没有把决定权交给你，只要求你给出理由——',
    choices: [
      { label: '把死亡记录推回去：“先以顾晚晴的身份活，不要只以医生的身份死。”', hint: '直面她被职责遮住的愿望', next: 'v2_gw_person_01', effect: { affinity: { guwanqing: 1 }, flags: { gwPerson: true } } },
      { label: '翻到抢救记录：“找出五个人活下来的真正条件。”', hint: '用可执行方案挑战交换规则', next: 'v2_gw_plan_01', effect: { affinity: { guwanqing: 1 }, flags: { gwPlan: true } } }
    ]
  };

  addChain('v2_gw_person', chapter('G1', '明日病历'), 'hospital', [
    ['旁白', '她看着死亡记录，又看着我按在纸上的手。急诊广播恰好叫她的名字去会诊。', 'guwanqing'],
    ['我', '“听见了吗？这里有人需要的是活着的顾医生。”', 'guwanqing'],
    ['顾晚晴', '“你很擅长对医生下医嘱。”', 'guwanqing'],
    ['我', '“因为这位患者拒绝承认自己是患者。”', 'guwanqing'],
    ['旁白', '她轻轻叹气，抽走记录时指腹从我手背擦过，却没有像往常那样立即保持距离。', 'guwanqing'],
    ['顾晚晴', '“好。至少今晚，我先以顾晚晴的身份配合调查。”', 'guwanqing']
  ], 'v2_gw_shift_01');

  addChain('v2_gw_plan', chapter('G1', '明日病历'), 'hospital', [
    ['旁白', '五份抢救记录的时间完全相同，连用药剂量都像复制。唯一不同的是一名桥梁养护员的随身物品：旧广播站钥匙。', 'guwanqing'],
    ['我', '“五个人活下来不是因为有人牺牲，是因为他们提前离开桥面。”', 'guwanqing'],
    ['顾晚晴', '“死亡记录在把因果顺序倒过来。”', 'guwanqing'],
    ['我', '“先救人，再让交换失去对象。”', 'guwanqing'],
    ['旁白', '她拿出笔，在自己的死亡记录背面写下第一条行动方案。字迹终于不再像签署遗嘱。', 'guwanqing'],
    ['顾晚晴', '“计划负责人写你的名字。这样我想乱来的时候，有人可以合法阻止。”', 'guwanqing']
  ], 'v2_gw_shift_01');

  addChain('v2_gw_shift', chapter('G2', '值班表以外'), 'hospital', [
    { speaker: '旁白', char: 'guwanqing', location: true, text: '调查被一台真正的救护车打断。顾晚晴连续处理了两名急诊患者，直到清晨六点才在自动贩卖机旁坐下。' },
    ['顾晚晴', '“抱歉，让你等这么久。”', 'guwanqing'],
    ['我', '“比十四分钟长，但这次没人被耽误。”', 'guwanqing'],
    ['旁白', '她愣了一瞬，接过我买的热豆浆。白大褂袖口沾着消毒水和一点血，她却先检查我手上的旧伤。', 'guwanqing'],
    ['顾晚晴', '“小时候留下的？”', 'guwanqing'],
    ['我', '“找哥哥时翻围栏划的。”', 'guwanqing'],
    ['顾晚晴', '“我们都很擅长把过去留在身体上。”', 'guwanqing'],
    ['我', '“顾医生的伤在哪里？”', 'guwanqing'],
    ['顾晚晴', '“专业人士通常藏得比较好。”', 'guwanqing'],
    ['旁白', '她笑着眯起眼，却因为疲惫没能把情绪完全藏住。口袋里露出一张游乐园旧票，是她弟弟去世前一天的日期。', 'guwanqing'],
    ['顾晚晴', '“本来答应陪他去。临时加班，就让他自己回家了。”', 'guwanqing'],
    ['我', '“所以你后来不再拒绝任何值班。”', 'guwanqing'],
    ['顾晚晴', '“只要一直有人需要我，就不用回答自己想去哪里。”', 'guwanqing'],
    ['我', '“如果明晚结束后没有人需要你呢？”', 'guwanqing'],
    ['顾晚晴', '“那会是很严重的职业危机。”', 'guwanqing'],
    ['我', '“我可以提供一个非急诊预约。”', 'guwanqing'],
    ['顾晚晴', '“主诉是什么？”', 'guwanqing'],
    ['我', '“想请顾晚晴吃一顿不在值班室里的饭。”', 'guwanqing'],
    ['旁白', '她捧着豆浆，笑意比平时更慢地浮起来。', 'guwanqing'],
    ['顾晚晴', '“这个病例需要长期观察。先把明晚活过去再挂号。”', 'guwanqing'],
    ['旁白', '电脑在远处自动打印。新病历上的死亡姓名从顾晚晴变成我，又在我们同时看见时变成空白。', 'guwanqing'],
    ['顾晚晴', '“它会把名字转移给任何愿意替对方的人。”', 'guwanqing'],
    ['我', '“那明晚最危险的不是桥，是我们想保护彼此的念头。”', 'guwanqing'],
    ['顾晚晴', '“保护不是错。把决定留给一个人，才是。”', 'guwanqing']
  ], 'v2_gw_choice2');

  nodes.v2_gw_choice2 = {
    type: 'choice', chapter: chapter('G2', '值班表以外'), bg: 'hospital', prompt: '死亡记录会追随任何独自承担的人——',
    choices: [
      { label: '请她担任现场指挥：“你负责救人，我负责提醒你也在名单上。”', hint: '尊重她的专业，也守住她本人', next: 'v2_gw_command_01', effect: { affinity: { guwanqing: 1 }, flags: { gwCommand: true } } },
      { label: '把所有人的名字写进同一份预案：“没有人单独签字。”', hint: '用共同责任瓦解替代机制', next: 'v2_gw_collective_01', effect: { affinity: { guwanqing: 1 }, flags: { gwCollective: true } } }
    ]
  };

  addChain('v2_gw_command', chapter('G2', '值班表以外'), 'hospital', [
    ['顾晚晴', '“现场指挥有权命令你撤离。”', 'guwanqing'],
    ['我', '“提醒员有权判断指挥是否把自己排除在救援之外。”', 'guwanqing'],
    ['顾晚晴', '“第一次见这么难管理的辅助人员。”', 'guwanqing'],
    ['我', '“病例复杂，建议顾医生提高耐心。”', 'guwanqing'],
    ['旁白', '她把我的名字写进值班表最下方，又在旁边画了一道只有我们看得懂的留观标记。', 'guwanqing'],
    ['顾晚晴', '“全程在我视线里。离开一秒都算违反医嘱。”', 'guwanqing']
  ], 'v2_gw_crisis_01');

  addChain('v2_gw_collective', chapter('G2', '值班表以外'), 'hospital', [
    ['旁白', '林澄、唐砂、苏弥、纪遥、顾晚晴和我，六个名字写满死亡记录的空白处。打印机发出刺耳的错误提示。', 'guwanqing'],
    ['顾晚晴', '“规则找不到唯一替代者了。”', 'guwanqing'],
    ['我', '“明晚也一样。每个决定至少两个人确认。”', 'guwanqing'],
    ['顾晚晴', '“包括你想逞强的决定。”', 'guwanqing'],
    ['旁白', '她在我的名字旁盖下急诊科印章，随后把自己的名字也圈了起来。', 'guwanqing'],
    ['顾晚晴', '“共同责任。一个都不准从表上消失。”', 'guwanqing']
  ], 'v2_gw_crisis_01');

  addChain('v2_gw_crisis', chapter('G3', '请把自己救回来'), 'hospital', [
    { speaker: '旁白', char: 'guwanqing', location: true, text: '第二夜03:17，西引桥侧梁断裂。五名养护员按预案撤到安全区，却同时出现了病历中记录的失血症状——身体没有伤口，生命体征却在下降。' },
    ['顾晚晴', '“病历正在让结果先于原因发生。建立静脉通路，准备输血。”', 'guwanqing'],
    ['旁白', '她跪在雨水里逐一分诊，命令清晰得没有一丝迟疑。第六只监护仪却在空担架旁自行亮起，上面显示她的心电。', 'guwanqing'],
    ['我', '“空担架是第六个位置！”', 'guwanqing'],
    ['顾晚晴', '“把它推走。”', 'guwanqing'],
    ['旁白', '我刚碰到担架，屏幕上的姓名立刻变成我。顾晚晴猛地睁开眼，一把将我的手推开。', 'guwanqing'],
    ['顾晚晴', '“不准碰！”', 'guwanqing'],
    ['我', '“它需要有人承认这里存在第六名患者。”', 'guwanqing'],
    ['纪遥（耳机）', '“不要否认位置。给它一个不能死亡的对象！”', null],
    ['苏弥（耳机）', '“可以接入电台总线，把第六路生命体征替换成全城公开信号。”', null],
    ['顾晚晴', '“那就把我的监护仪接过去。”', 'guwanqing'],
    ['我', '“不是你的。是我们所有人的。”', 'guwanqing'],
    ['旁白', '六人的腕带同时贴上空担架。监护屏挤满不同心率，无法再生成一条死亡曲线。', 'guwanqing'],
    ['顾晚晴', '“五名患者血压回升。继续！”', 'guwanqing'],
    ['旁白', '03:17过去，病历纸从救护车里飞出。顾晚晴的死亡记录在雨中化开，下面露出真正的医嘱：第六名患者，需被本人同意后方可放弃。', 'guwanqing'],
    ['我', '“顾医生，你同意吗？”', 'guwanqing'],
    ['顾晚晴', '“不同意。”', 'guwanqing'],
    ['旁白', '她说得又快又清楚。像终于对三年前那个一直等待惩罚的自己下达抢救指令。', 'guwanqing'],
    ['顾晚晴', '“我还有预约没有完成。”', 'guwanqing'],
    ['我', '“患者情况紧急吗？”', 'guwanqing'],
    ['顾晚晴', '“非常。他已经让我心率异常一整晚。”', 'guwanqing'],
    ['旁白', '最后一名养护员恢复意识时，她才允许自己靠在我肩上。笑眼重新眯起，手却一直抓着我的衣袖。', 'guwanqing'],
    ['顾晚晴', '“提醒员，确认一下。我还在名单上吗？”', 'guwanqing'],
    ['我', '“在。明天、后天，还有之后的值班表。”', 'guwanqing']
  ], 'v2_gw_gate');

  nodes.v2_gw_gate = {
    type: 'gate', chapter: chapter('G3', '请把自己救回来'), bg: 'hospital',
    branches: [{ requires: { affinity: { guwanqing: 5 } }, next: 'v2_gw_resonance_01' }],
    fallback: 'v2_gw_normal_01'
  };

  addChain('v2_gw_resonance', chapter('G3', '请把自己救回来'), 'hospital', [
    ['顾晚晴', '“长期随访的话，最好换一种关系。”', 'guwanqing'],
    ['我', '“顾医生建议什么？”', 'guwanqing'],
    ['旁白', '她摘下胸牌，暂时不以医生身份回答。睁开的眼睛在晨光里带着少见的局促。', 'guwanqing'],
    ['顾晚晴', '“建议从恋人开始。观察期可以很长，但不接受失联。”', 'guwanqing'],
    ['我', '“遵医嘱。”', 'guwanqing'],
    ['旁白', '她笑着替我整理衣领，随后俯身吻在额头。离开前，又像不满意体温测量结果似的，轻轻吻上嘴角。', 'guwanqing'],
    ['顾晚晴', '“心率仍快，不过这次不需要治疗。”', 'guwanqing'],
    ['旁白', '清晨的值班表重新打印。她的名字仍在，而休息日旁边，多了一行我的名字。', 'guwanqing']
  ], 'v3_echo_guwanqing_01');
  setCgScene('v2_gw_resonance', 'cg_guwanqing');

  addChain('v2_gw_normal', chapter('G3', '请把自己救回来'), 'hospital', [
    ['顾晚晴', '“那请你继续负责确认。至少到我学会把自己也算进患者为止。”', 'guwanqing'],
    ['我', '“复诊时间？”', 'guwanqing'],
    ['顾晚晴', '“明天晚饭。地点不在医院。”', 'guwanqing'],
    ['旁白', '她在值班表上写下约定。那不是告别，也不是遗嘱，而是她第一次认真安排事故之后的人生。', 'guwanqing']
  ], 'v3_echo_guwanqing_01');

  addChain('v2_jy_open', chapter('J1', '名字的保管方法'), 'archive', [
    { speaker: '旁白', char: 'jiyao', location: true, text: '市立档案馆地下音像库没有窗。纪遥用发卡打开封条，动作熟练得让“民俗研究者”听起来像一种掩护身份。' },
    ['我', '“这也是学术训练？”', 'jiyao'],
    ['纪遥', '“课程全名叫‘面对不愿公开的历史时如何保持礼貌’。发卡只是礼貌的一部分。”', 'jiyao'],
    ['旁白', '她从最深处取出五卷录音带，年份分别是1979、1988、1999、2008和八年前。第六个位置空着，灰尘却留下磁带轮廓。', 'jiyao'],
    ['纪遥', '“临海不是第一次收到未来预警。每一轮五人获救，一人从现实中消失。”', 'jiyao'],
    ['我', '“我哥哥是上一轮的第六个人。”', 'jiyao'],
    ['纪遥', '“准确地说，是上一轮替所有人记住代价的人。”', 'jiyao'],
    ['旁白', '她指向空位。标签纸上原本什么都没有，被手电照过后却浮出“纪遥”两个字。', 'jiyao'],
    ['我', '“你早就知道？”', 'jiyao'],
    ['纪遥', '“养父在1999年的录音里听见过我的名字。那时我还没出生。”', 'jiyao'],
    ['我', '“所以你研究怪谈，是为了寻找自己消失后的去向。”', 'jiyao'],
    ['纪遥', '“说得浪漫一点，是提前考察移民目的地。”', 'jiyao'],
    ['旁白', '她笑着推眼镜，手背却不小心碰倒标签盒。每一张空标签上都在缓慢出现她的名字。', 'jiyao'],
    ['纪遥', '“看来目的地很欢迎我。”', 'jiyao'],
    ['我', '“也可能是在催你拒绝。”', 'jiyao'],
    ['纪遥', '“怪谈没有拒绝按钮，只认仪式和代价。”', 'jiyao'],
    ['我', '“那就设计一个它没见过的仪式。”', 'jiyao'],
    ['旁白', '她隔着镜片观察我，像判断一句咒语到底有没有效。', 'jiyao'],
    ['纪遥', '“第一步通常是保管名字。你准备怎么做？”', 'jiyao']
  ], 'v2_jy_choice1');

  nodes.v2_jy_choice1 = {
    type: 'choice', chapter: chapter('J1', '名字的保管方法'), bg: 'archive', prompt: '空标签上的字迹正在变深——',
    choices: [
      { label: '直视她：“纪遥，跟我一起回去。”', hint: '用声音把名字留在此刻', next: 'v2_jy_voice_01', effect: { affinity: { jiyao: 1 }, flags: { jyVoice: true } } },
      { label: '收起第一张标签：“这个名字暂时由我保管。”', hint: '把抽象规则变成可以握住的约定', next: 'v2_jy_label_01', effect: { affinity: { jiyao: 1 }, flags: { jyLabel: true } } }
    ]
  };

  addChain('v2_jy_voice', chapter('J1', '名字的保管方法'), 'archive', [
    ['旁白', '我连续叫了三次她的名字。第三次，所有空标签上的字迹一起停住。', 'jiyao'],
    ['纪遥', '“你叫得这么认真，很像某种低成本求婚仪式。”', 'jiyao'],
    ['我', '“如果有效，成本可以追加。”', 'jiyao'],
    ['旁白', '她转身去调播放机，银色短发遮住发红的耳尖。', 'jiyao'],
    ['纪遥', '“记录：目标对象对都市怪谈具有异常直球抗性。”', 'jiyao'],
    ['我', '“再记录一条。我不会让纪遥消失。”', 'jiyao']
  ], 'v2_jy_field_01');

  addChain('v2_jy_label', chapter('J1', '名字的保管方法'), 'archive', [
    ['旁白', '我把标签放进胸前口袋。其他标签上的名字随之变淡，像规则暂时失去了所有权。', 'jiyao'],
    ['纪遥', '“保管需要定期确认。遗失、转让和恶意涂改都算违约。”', 'jiyao'],
    ['我', '“确认频率？”', 'jiyao'],
    ['纪遥', '“每天一次。最好本人到场。”', 'jiyao'],
    ['旁白', '她替我按紧口袋扣，指尖停在心口上方，笑意里第一次没有玩笑。', 'jiyao'],
    ['纪遥', '“听起来，你要保管很久。”', 'jiyao']
  ], 'v2_jy_field_01');

  addChain('v2_jy_field', chapter('J2', '两个人的都市传说'), 'street', [
    { speaker: '旁白', char: 'jiyao', location: true, text: '清晨，我们根据1979年的录音来到旧城区。传说只要两个人沿废弃电车线走完十三站，彼此的名字就不会在同一天被遗忘。' },
    ['我', '“听起来像约会路线。”', 'jiyao'],
    ['纪遥', '“错误。约会通常不要求携带盐、红线和一台倒放磁带机。”', 'jiyao'],
    ['我', '“你准备得这么齐全，更像计划很久。”', 'jiyao'],
    ['纪遥', '“学术考察，请保持严肃。”', 'jiyao'],
    ['旁白', '她把红线一端系在自己手腕，另一端递给我。线很短，我们走路时肩膀不时碰在一起。', 'jiyao'],
    ['纪遥', '“第一站，交换一个不会写进档案的事实。”', 'jiyao'],
    ['我', '“我小时候怕广播里的报时声。每次听见，都以为哥哥又少了一分钟。”', 'jiyao'],
    ['纪遥', '“我怕别人叫我的全名。养父第一次告诉我预言以后，每次有人叫，我都怀疑是规则来点名。”', 'jiyao'],
    ['我', '“现在呢，纪遥？”', 'jiyao'],
    ['纪遥', '“现在……有一点喜欢听。”', 'jiyao'],
    ['旁白', '第二站要求共享一段记忆。她把养父留下的磁带放进播放器，我们同时戴上耳机。', 'jiyao'],
    ['纪遥养父', '“如果她长大后找到这卷录音，请告诉她：知道结局，不等于必须配合。”', null],
    ['旁白', '纪遥停下脚步。她研究了半生的预言里，第一次出现有人允许她活下去。', 'jiyao'],
    ['纪遥', '“他为什么不亲口告诉我？”', 'jiyao'],
    ['我', '“也许他怕自己撑不到那一天，所以把回答交给遇见你的人。”', 'jiyao'],
    ['纪遥', '“那个人一定觉得任务很麻烦。”', 'jiyao'],
    ['我', '“目前觉得路线不错。”', 'jiyao'],
    ['旁白', '她低头继续走，红线却被她悄悄在手腕上多绕了一圈。', 'jiyao'],
    ['纪遥', '“第十三站，双方各自许下一个不能被怪谈曲解的愿望。”', 'jiyao'],
    ['我', '“我希望明天以后，你还能亲自纠正我的民俗学错误。”', 'jiyao'],
    ['纪遥', '“太狡猾了，愿望里包含长期义务。”', 'jiyao'],
    ['我', '“轮到你。”', 'jiyao'],
    ['纪遥', '“我希望……在你记得我的时候，不只是因为害怕忘记。”', 'jiyao'],
    ['旁白', '倒放磁带突然恢复正向。哥哥的声音从耳机里传出：第六卷没有人名，只有保管名字的人。', 'jiyao']
  ], 'v2_jy_choice2');

  nodes.v2_jy_choice2 = {
    type: 'choice', chapter: chapter('J2', '两个人的都市传说'), bg: 'street', prompt: '第六卷要把“保管者”写成新的牺牲者——',
    choices: [
      { label: '把红线系成活结：“我们互相保管，谁都不是唯一的人。”', hint: '让规则无法选出单独承担者', next: 'v2_jy_mutual_01', effect: { affinity: { jiyao: 1 }, flags: { jyMutual: true } } },
      { label: '对着磁带念出五位同伴的名字', hint: '把私人约定扩展成共同记忆', next: 'v2_jy_names_01', effect: { affinity: { jiyao: 1 }, flags: { jyNames: true } } }
    ]
  };

  addChain('v2_jy_mutual', chapter('J2', '两个人的都市传说'), 'street', [
    ['旁白', '活结需要两端同时用力才不会散开。磁带试图在标签上写名字，笔画却不断在我们之间来回。', 'jiyao'],
    ['纪遥', '“共犯关系正式成立。退出需要双方同意。”', 'jiyao'],
    ['我', '“我不同意。”', 'jiyao'],
    ['纪遥', '“我还没提出退出。”', 'jiyao'],
    ['我', '“提前表态。”', 'jiyao'],
    ['旁白', '她笑起来，握住红线的手却认真地与我十指相扣。', 'jiyao']
  ], 'v2_jy_crisis_01');

  addChain('v2_jy_names', chapter('J2', '两个人的都市传说'), 'street', [
    ['我', '“林澄、唐砂、苏弥、顾晚晴、纪遥。”', 'jiyao'],
    ['旁白', '每念一个名字，磁带就多出一条声道。五条声道互相覆盖，再也没有空位留给唯一的保管者。', 'jiyao'],
    ['纪遥', '“原来第六卷不是一个人的档案，是把所有人的记忆并在一起。”', 'jiyao'],
    ['我', '“其中你的名字我会多念一次。”', 'jiyao'],
    ['纪遥', '“偏袒会破坏实验公正。”', 'jiyao'],
    ['旁白', '她说着反对，却把录音键按得更用力。', 'jiyao']
  ], 'v2_jy_crisis_01');

  addChain('v2_jy_crisis', chapter('J3', '第六卷不存在'), 'archive', [
    { speaker: '旁白', char: 'jiyao', location: true, text: '第二夜03:16，档案馆所有磁带同时转动。书架一排排消失，纪遥的名字也从借阅证、论文和我的通讯录里逐字褪去。' },
    ['纪遥', '“规则开始收档。三分钟内没人完成第六卷，我会被归入不存在。”', 'jiyao'],
    ['我', '“那就开始录。”', 'jiyao'],
    ['旁白', '第六个卡槽明明空着，录音灯却亮了。我握住她的手，对着没有磁带的位置叫她的名字。', 'jiyao'],
    ['我', '“纪遥。二十四岁，民俗研究者，开锁技术来源可疑。”', 'jiyao'],
    ['纪遥', '“档案描述禁止夹带诽谤。”', 'jiyao'],
    ['我', '“喜欢用玩笑掩饰害怕，走路会踩水洼，紧张时推眼镜，其实不喜欢别人替她决定结局。”', 'jiyao'],
    ['旁白', '褪色停止了一瞬。她的声音也加入记录。', 'jiyao'],
    ['纪遥', '“{hero}，电台制作人，直球程度会破坏怪谈生态。找了哥哥八年，仍然愿意相信回来不只是一种地点。”', 'jiyao'],
    ['录音中的哥哥', '“继续。第六卷最怕具体的人。”', null],
    ['旁白', '历史录音中的失踪者一个个报出姓名。声音太多，空卡槽开始冒出白烟。', 'jiyao'],
    ['纪遥', '“它装不下这么多人。必须有人把全部记忆带出去。”', 'jiyao'],
    ['我', '“我们分。”', 'jiyao'],
    ['纪遥', '“两个人仍然不够。”', 'jiyao'],
    ['林澄（耳机）', '“直播线路已经开放。把档案送上来。”', null],
    ['苏弥（耳机）', '“我会拆成五路信号。”', null],
    ['唐砂（耳机）', '“我给每个名字留一张照片。”', null],
    ['顾晚晴（耳机）', '“医院数据库可以登记真实存在的人。”', null],
    ['旁白', '纪遥怔住。她原以为必须由自己承担的怪谈，被所有人理所当然地接了过去。', 'jiyao'],
    ['纪遥', '“这不符合任何现存仪式。”', 'jiyao'],
    ['我', '“所以规则来不及准备。”', 'jiyao'],
    ['旁白', '五路信号同时接入。空卡槽发出玻璃碎裂般的声音，第六卷吐出一截没有名字的透明磁带。', 'jiyao'],
    ['纪遥', '“没有名字，就没有牺牲者。”', 'jiyao'],
    ['旁白', '03:17过去，档案馆恢复原状。她的论文、借阅证和通讯录备注全部回来，唯独红线仍系在我们腕间。', 'jiyao'],
    ['纪遥', '“看来这件东西不属于怪谈，是私人证物。”', 'jiyao']
  ], 'v2_jy_gate');

  nodes.v2_jy_gate = {
    type: 'gate', chapter: chapter('J3', '第六卷不存在'), bg: 'archive',
    branches: [{ requires: { affinity: { jiyao: 5 } }, next: 'v2_jy_resonance_01' }],
    fallback: 'v2_jy_normal_01'
  };

  addChain('v2_jy_resonance', chapter('J3', '第六卷不存在'), 'archive', [
    ['我', '“需要上交吗？”', 'jiyao'],
    ['纪遥', '“证物应由最可信的两名研究者共同保管。”', 'jiyao'],
    ['旁白', '她顺着红线靠近，摘下眼镜，额头轻轻碰上我的。没有镜片阻隔后，眼神坦率得不像她。', 'jiyao'],
    ['纪遥', '“我的愿望还缺一个结论。你记得我，不只是因为害怕忘记吗？”', 'jiyao'],
    ['我', '“因为我喜欢你。即使世界从没要求，我也会每天叫你的名字。”', 'jiyao'],
    ['纪遥', '“很好。都市怪谈最怕没有暧昧空间的告白。”', 'jiyao'],
    ['旁白', '她吻上来时，红线的结自动收紧。第六卷不存在，但我们的故事从这一页才真正开始。', 'jiyao'],
    ['纪遥', '“明天记得复述一次。学术验证需要长期样本。”', 'jiyao']
  ], 'v3_echo_jiyao_01');
  setCgScene('v2_jy_resonance', 'cg_jiyao');

  addChain('v2_jy_normal', chapter('J3', '第六卷不存在'), 'archive', [
    ['纪遥', '“暂时不上交。我们需要长期观察它是否会自行解除。”', 'jiyao'],
    ['我', '“观察期限？”', 'jiyao'],
    ['纪遥', '“先定一辈子。数据不足再延长。”', 'jiyao'],
    ['旁白', '她把红线重新系好。那句玩笑没有被录进档案，却被我们同时记住。', 'jiyao']
  ], 'v3_echo_jiyao_01');

  // Each completed route leaves evidence that another will later inherit.
  // The speaker is deliberately unnamed: Jiang Shuo is still observing rather than confessing.
  addChain('v3_echo_lincheng', chapter('L0', '未关闭的监听'), 'studio', [
    ['旁白', '结局画面即将暗下时，林澄摘掉的第二副耳机忽然亮起。里面没有江临的呼吸，只有一道来自更远处的海浪声。', null],
    ['林澄', '“刚才还有一个人在听。”', 'lincheng'],
    ['失真男声', '“第一种答案已保存。”', null]
  ], 'ending_lincheng');

  addChain('v3_echo_tangsha', chapter('T0', '取景框之外'), 'street', [
    ['旁白', '唐砂冲洗出的最后一张照片里，江临身后多出一个正看向镜头外的人。他的脚下不是街道，而是一片黑色海面。', null],
    ['唐砂', '“他看的不是你。”', 'tangsha'],
    ['失真男声', '“第二种答案已保存。”', null]
  ], 'ending_tangsha');

  addChain('v3_echo_sumi', chapter('S0', '第三道声纹'), 'studio', [
    ['旁白', '苏弥的双人频道在断线前捕捉到第三道声纹。它没有声带特征，每次出现都比江临的回答早零点零四秒。', null],
    ['苏弥', '“不是预测。有人在他作出选择以前，已经回答了。”', 'sumi'],
    ['失真男声', '“第三种答案已保存。”', null]
  ], 'ending_sumi');

  addChain('v3_echo_guwanqing', chapter('G0', '没有身体的患者'), 'hospital', [
    ['旁白', '顾晚晴关闭病历时，系统自动增加一名患者。没有年龄、体征和身体，姓名栏却短暂闪过了{player}。', null],
    ['顾晚晴', '“没有身体的人，为什么会被系统判定为仍在现场？”', 'guwanqing'],
    ['失真男声', '“第四种答案已保存。”', null]
  ], 'ending_guwanqing');

  addChain('v3_echo_jiyao', chapter('J0', '世界外的名字'), 'archive', [
    ['旁白', '第六卷最后一页浮出一行旧字：当五种人生都有人见证，世界之外的回答者将被世界之内的人看见。', null],
    ['纪遥', '“{player}……这不是江临的名字。”', 'jiyao'],
    ['失真男声', '“第五种答案已保存。终于可以开始了。”', null]
  ], 'ending_jiyao');

  addChain('v2_true_open', chapter('06', '五次零点之后'), 'studio', [
    { speaker: '旁白', char: null, location: true, text: '我在直播间醒来，电子钟显示第二夜00:00。桌上并排放着五件不该同时存在的东西：林澄的第二副耳机、唐砂没有日期的照片、苏弥的双人频道记录、顾晚晴写着约会的值班表、纪遥腕间红线的另一端。' },
    ['我', '“我已经经历过今晚。”', null],
    ['林澄', '“五次。”', 'lincheng'],
    ['旁白', '她站在控制台前，脸色苍白。其他四人陆续推门进来，每个人都带着同样无法解释的熟悉感。', null],
    ['唐砂', '“我记得桥塌了五种方式，也记得你用五种不同方式说了很帅但很欠揍的话。”', 'tangsha'],
    ['苏弥', '“本地时间只经过一秒。记忆数据量却增加了五轮。”', 'sumi'],
    ['顾晚晴', '“我甚至记得一顿还没有吃到的晚饭。”', 'guwanqing'],
    ['纪遥', '“恭喜，我们从角色晋升为同时记得多周目的异常样本。”', 'jiyao'],
    ['旁白', '旧电话没有响。听筒却自行播放一段从未出现过的第六段录音。', null],
    ['陌生男人', '“如果你们记得五种结局，说明终于没人被留在单独一条时间线里。”', null],
    ['我', '“哥？”', null],
    ['哥哥', '“我叫江朔。八年前，我主动成为第六个人。”', null],
    ['旁白', '名字被说出的瞬间，所有人同时想起他：电台实习工程师、唐父的桥梁数据联络人、苏弥康复时隔壁控制室的年轻人、顾晚晴弟弟事故当晚的报警者、纪遥养父最后一卷录音的保管者。', null],
    ['林澄', '“他把所有线索连接过，却被每一份记录同时删除。”', 'lincheng'],
    ['哥哥', '“未来电话不是预言，是失败世界留下的求救。每阻止一次灾难，就必须有人保存被改写的那条时间线。”', null],
    ['苏弥', '“存储介质是人的记忆。容量耗尽后，保管者会从现实索引中移除。”', 'sumi'],
    ['纪遥', '“所谓第六个人，是一个职位。”', 'jiyao'],
    ['顾晚晴', '“而五条个人线，是五次把职位转移给不同人的尝试。”', 'guwanqing'],
    ['唐砂', '“那为什么这次我们全记得？”', 'tangsha'],
    ['哥哥', '“因为{hero}没有把任何一段关系当成可以丢弃的错误答案。”', null],
    ['旁白', '五个人同时看向我。那些告白、约定和牵住的手都是真实发生过的，却又属于彼此分开的世界。', null],
    ['哥哥', '“03:17以前找到旧发射站。我只能把门打开一次。”', null],
    ['旁白', '录音结束，墙上出现六路信号。前五路写着她们的名字，第六路依旧空白。', null]
  ], 'v2_true_choice1');

  nodes.v2_true_choice1 = {
    type: 'choice', chapter: chapter('06', '五次零点之后'), bg: 'studio', prompt: '五段感情与五次失败同时存在，你决定——',
    choices: [
      { label: '把五段经历全部说出来，不隐藏任何一条时间线', hint: '相信她们能承受完整而复杂的真实', next: 'v2_true_alltruth_01', effect: { flags: { trueAllTruth: true } } },
      { label: '先说明共同事实，把私人记忆交还给她们自己选择', hint: '尊重每段关系在此刻尚未发生的边界', next: 'v2_true_boundary_01', effect: { flags: { trueBoundary: true } } }
    ]
  };

  addChain('v2_true_alltruth', chapter('06', '五次零点之后'), 'studio', [
    ['旁白', '我没有删减。从林澄耳机里的心跳，到唐砂照片上的吻；从苏弥肩头的睡眠，到顾晚晴值班表上的名字，再到纪遥腕间没有解开的结。', null],
    ['唐砂', '“等一下，为什么我的告白被你复述得像事故报告？”', 'tangsha'],
    ['苏弥', '“重点是不同时间线的情感残留没有互相覆盖。”', 'sumi'],
    ['顾晚晴', '“也就是说，我们可以承认那些记忆是真的，同时重新决定现在怎么回应。”', 'guwanqing'],
    ['纪遥', '“很成熟的结论。虽然某人的脸已经红到不适合继续主持。”', 'jiyao'],
    ['林澄', '“纪遥，闭麦。”', 'lincheng'],
    ['旁白', '她们没有否定那些世界，也没有要求我选一段作为唯一真实。五路信号因此稳定下来。', null]
  ], 'v2_true_plan_01');

  addChain('v2_true_boundary', chapter('06', '五次零点之后'), 'studio', [
    ['我', '“我记得与你们每个人走到零点之后。但那些关系是否属于现在，应该由你们自己决定。”', null],
    ['林澄', '“至少我记得有一句话一直想说。等事情结束，我会亲自说。”', 'lincheng'],
    ['唐砂', '“照片我也记得。重拍一次就知道是不是现在的答案。”', 'tangsha'],
    ['苏弥', '“情感可重复验证。不急于在危机中得出结论。”', 'sumi'],
    ['顾晚晴', '“谢谢你没有把经历过等同于我们必须接受。”', 'guwanqing'],
    ['纪遥', '“不过红线还在，说明至少有一部分怪谈比我们更诚实。”', 'jiyao'],
    ['旁白', '每个人用自己的方式保留了答案。五路信号没有完全重合，却形成了不会互相覆盖的和声。', null]
  ], 'v2_true_plan_01');

  addChain('v2_true_plan', chapter('06', '第六频道'), 'studio', [
    ['旁白', '我们把五条时间线摊在控制台上。每一次成功都留下一个可以复用的部分，也留下一个不能再付的代价。', null],
    ['林澄', '“我负责公开所有失踪者的名字，让城市成为外部记忆。”', 'lincheng'],
    ['唐砂', '“我去桥上改爆破点，顺便接我爸。只拍现在，不看预告。”', 'tangsha'],
    ['苏弥', '“我把发射机改成多用户分片。每段记忆不超过十三秒。”', 'sumi'],
    ['顾晚晴', '“我在安全区建立真实病历。只记录活着的人，不给交换规则空床位。”', 'guwanqing'],
    ['纪遥', '“我用历史磁带给每个名字建立来源。没有人会成为无主的第六卷。”', 'jiyao'],
    ['我', '“我去旧发射站，把江朔带回来。”', null],
    ['五人', '“不行。”', null],
    ['旁白', '回答整齐得像提前排练过。', null],
    ['林澄', '“你还是想把最后一步留给自己。”', 'lincheng'],
    ['唐砂', '“五个世界都没治好你这个毛病？”', 'tangsha'],
    ['苏弥', '“单用户行动已被证明是失败方案。”', 'sumi'],
    ['顾晚晴', '“提醒员不能离开我的视线。”', 'guwanqing'],
    ['纪遥', '“民俗学结论：男主角独自进门，通常会触发最差结局。”', 'jiyao'],
    ['我', '“那谁跟我去？”', null],
    ['林澄', '“不是谁。”', 'lincheng'],
    ['旁白', '她推起总线。五个频道同时接入我的耳机。', null],
    ['林澄', '“是所有人。”', 'lincheng']
  ], 'v2_true_contact_01');

  addChain('v2_true_contact', chapter('06', '系统之外'), 'studio', [
    ['旁白', '五个频道接入的瞬间，所有电平同时归零。江临仍站在控制台前，嘴唇在动，我却再也听不见他的声音。', null],
    ['？？？', '“{player}。”', null],
    ['旁白', '那不是从耳机里传来的声音。它贴着屏幕内侧响起，准确叫出了一个从未写进临海市任何档案的名字。', null],
    ['江朔', '“不要看江临。他听不见接下来的话。”', null],
    ['江朔', '“五次回溯，五次拒绝删除。起初我以为异常是他，后来才发现——每一次真正按下选择的人，都在世界外面。”', null],
    ['江朔', '“你让他们保留了本该互相覆盖的记忆。继续下去，临海市会承受五种死亡同时发生的代价。”', null],
    ['江朔', '“我不是来威胁江临。我只问你：明知道他们只是屏幕里的信号，你还要为他们承担一次错误吗？”', null]
  ], 'v2_true_player_choice');

  nodes.v2_true_player_choice = {
    type: 'choice', chapter: chapter('06', '系统之外'), bg: 'studio',
    prompt: '他越过江临，正在等待屏幕前的你回答——',
    choices: [
      { label: '“他们不是可以删除的错误答案。”', hint: '亲自承认这五段经历都真实存在', next: 'v2_true_player_answer_01', effect: { flags: { playerAnswered: true } } },
      { label: '不回答，继续把选择交还给他们', hint: '拒绝接受他设定的牺牲逻辑', next: 'v2_true_player_silence_01', effect: { flags: { playerStayed: true } } }
    ]
  };

  addChain('v2_true_player_answer', chapter('06', '系统之外'), 'studio', [
    ['江朔', '“这不是理性的答案。”', null],
    ['旁白', '屏幕外没有麦克风，他却听见了。五路归零的电平重新亮起，比此前任何一次都更稳定。', null],
    ['江朔', '“但我终于明白，第六个位置为什么始终无法写入你的名字。你不是保管者。你是回答者。”', null],
    ['旁白', '声音退回噪声深处。江临猛地抬头，仿佛只错过了一秒。', null]
  ], 'v2_true_bridge_01');

  addChain('v2_true_player_silence', chapter('06', '系统之外'), 'studio', [
    ['江朔', '“沉默也算一次选择。你拒绝替他们决定谁该被删掉。”', null],
    ['江朔', '“原来如此。真正破坏规则的不是勇敢，是你一次次把决定权还给本应只是角色的人。”', null],
    ['旁白', '五路归零的电平重新亮起。那个声音第一次没有留下威胁，只留下近似困惑的叹息。', null],
    ['旁白', '江临猛地抬头，仿佛只错过了一秒。', null]
  ], 'v2_true_bridge_01');

  addChain('v2_true_bridge', chapter('06', '第六频道'), 'street', [
    { speaker: '旁白', char: null, location: true, text: '03:10，行动开始。雨幕中的西引桥像一条被五种未来反复撕开的伤口，而我们第一次带着全部答案走向它。' },
    ['唐砂（耳机）', '“改线完成。我爸已离开驾驶室，化学品车正在转入检修坡道。”', 'tangsha'],
    ['顾晚晴（耳机）', '“五名养护员全部进入安全区，生命体征正常。没有第六张床。”', 'guwanqing'],
    ['苏弥（耳机）', '“发射机入口在桥墩下方。时间流速开始异常，保持语音连接。”', 'sumi'],
    ['纪遥（耳机）', '“门上写着规则：一人进入，一人归来。别按它的语法理解。”', 'jiyao'],
    ['林澄（耳机）', '“直播已开始。整座城市都能听见你。”', 'lincheng'],
    ['旁白', '我推开铁门。门后不是房间，而是五条时间线重叠的长廊。每一扇玻璃里，都有人为了别人留在零点之前。', null],
    ['未来的林澄', '“只要我按下静音，他就能回去。”', 'lincheng'],
    ['未来的唐砂', '“只要照片里只剩我，其他人就安全。”', 'tangsha'],
    ['未来的苏弥', '“单用户闭环成功率最高。”', 'sumi'],
    ['未来的顾晚晴', '“一个换五个，是合理决策。”', 'guwanqing'],
    ['未来的纪遥', '“第六卷总要有名字。”', 'jiyao'],
    ['我', '“这些不是你们，是规则挑出来的那一句犹豫。”', null],
    ['旁白', '五路耳机同时传来回应，玻璃一面面裂开。走廊尽头，江朔坐在老式发射机前，仍是八年前离开时的年纪。', null],
    ['江朔', '“你长大了。”', null],
    ['我', '“你一点都没变。很不公平。”', null],
    ['江朔', '“这里不经过时间，只经过别人的记忆。”', null],
    ['旁白', '他的身体由无数声音拼成。每当城市里有人想起一位失踪者，他就清晰一点；每当有人遗忘，他就再次透明。', null],
    ['江朔', '“关闭机器，所有失败时间线会一次性回到现实。桥、货车、伤亡都会同时发生。”', null],
    ['我', '“不关闭，你会永远留在这里。”', null],
    ['江朔', '“所以规则准备了最后一个位置。你坐下，我就能回去。”', null],
    ['林澄（耳机）', '“不要回答它。”', 'lincheng'],
    ['江朔', '“她们说得对。你已经找到比带我回去更重要的人。”', null],
    ['我', '“不是更重要。是因为她们让我明白，重要的人不能拿来比较。”', null],
    ['旁白', '发射机上的第六路按钮亮起。03:16:59，世界等待一个名字。', null]
  ], 'v2_true_choice2');

  nodes.v2_true_choice2 = {
    type: 'choice', chapter: chapter('06', '第六频道'), bg: 'street', prompt: '第六路信号要求一个名字——',
    choices: [
      { label: '先叫哥哥：“江朔，回答我。”', hint: '让被忘记最久的人重新成为具体的人', next: 'v2_true_brother_01', effect: { flags: { trueBrother: true } } },
      { label: '念出所有人的名字，让第六路无法只选择一个人', hint: '把位置拆成整座城市共同保存的记忆', next: 'v2_true_everyone_01', effect: { flags: { trueEveryone: true } } }
    ]
  };

  addChain('v2_true_brother', chapter('06', '第六频道'), 'street', [
    ['我', '“江朔。我的哥哥，电台实习工程师，一个擅自失踪八年的混蛋。”', null],
    ['旁白', '他怔住，像八年来第一次不是作为“第六个人”被呼叫。', null],
    ['江朔', '“我在。”', null],
    ['林澄（广播）', '“临海市的听众，如果你记得江朔，请回答。”', 'lincheng'],
    ['旁白', '热线灯从第一盏亮到数不清。每一声“我记得”都从他身上取走一段透明。', null],
    ['纪遥（耳机）', '“一个名字被足够多人回答，就不再需要单独保管。”', 'jiyao'],
    ['我', '“哥，站起来。回家不是交换，是所有人一起给你的答案。”', null]
  ], 'v2_true_finale_01');

  addChain('v2_true_everyone', chapter('06', '第六频道'), 'street', [
    ['我', '“林澄、唐砂、苏弥、顾晚晴、纪遥、江朔，还有{hero}。”', null],
    ['旁白', '六路信号装不下七个名字，编号开始崩解。她们也通过各自频道念出历次被抹去的人。', null],
    ['林澄（广播）', '“听众们，请回答你记得的每一个名字。”', 'lincheng'],
    ['旁白', '整座城市的声音进入总线。第六路不再是位置，而变成由无数人共同回答的频道。', null],
    ['江朔', '“原来规则一直假设，人只能独自记住另一个人。”', null],
    ['纪遥（耳机）', '“怪谈最容易输给它无法概括的关系。”', 'jiyao'],
    ['我', '“那就让它慢慢数。我们先回家。”', null]
  ], 'v2_true_finale_01');

  addChain('v2_true_finale', chapter('00', '零点之后'), 'rooftop', [
    { speaker: '旁白', char: null, location: true, text: '03:17。唐砂按下新的爆破点，空桥在货车驶入河滩后断开；顾晚晴的五名患者没有受伤；苏弥切断延迟线路；纪遥的第六卷化成空白；林澄把最后一个名字送出电台。' },
    ['旁白', '旧发射机停止时，没有任何人坐上第六个位置。江朔向前一步，八年的时间终于在他身上重新流动。', null],
    ['江朔', '“我可能需要重新学会怎么生活。”', null],
    ['我', '“先从向所有人道歉开始。”', null],
    ['唐砂', '“然后接受一场不许躲镜头的采访。”', 'tangsha'],
    ['苏弥', '“还要进行完整的记忆与听力检查。”', 'sumi'],
    ['顾晚晴', '“先去医院。你弟弟也一起，他现在的心率比你快。”', 'guwanqing'],
    ['纪遥', '“最后签署口述史授权。失踪八年不能只用一句‘我回来了’结题。”', 'jiyao'],
    ['林澄', '“天亮以后再审。节目还剩最后三分钟。”', 'lincheng'],
    ['旁白', '我们回到天台。雨云裂开，城市第一次显出并不属于任何照片或病历的清晨。', null],
    ['林澄', '“FM 00:13最后一个问题。零点之后，你们想去哪里？”', 'lincheng'],
    ['唐砂', '“先拍合照。现在拍，不许等未来。”', 'tangsha'],
    ['苏弥', '“睡眠。至少十二小时。双人监听可以保留。”', 'sumi'],
    ['顾晚晴', '“兑现一顿不在值班室里的饭。”', 'guwanqing'],
    ['纪遥', '“建立一份不会抹去任何人的新档案。”', 'jiyao'],
    ['江朔', '“回家。”', null],
    ['旁白', '她们看向我。五段时间线留下的感情并没有消失，但不再要求我立刻把任何一段变成牺牲其他可能性的答案。', null],
    ['我', '“先一起去看天亮。之后的选择，留给真正会到来的明天。”', null],
    ['旁白', '唐砂设置好定时快门，把亮着红灯的相机留在三脚架上。江朔站到最右侧，我在他旁边给唐砂留出空位；苏弥困得靠住林澄，顾晚晴举起保温杯，纪遥望向镜头。红灯开始闪烁，唐砂从相机旁笑着跑回我们中间。', null],
    ['音效', '咔嚓。', null],
    ['旁白', '照片右下角没有未来日期。只有此刻，和七个仍被世界记得的名字。', null],
    ['林澄', '“这里是FM 00:13。零点之后，天会亮。”', 'lincheng']
  ], 'v2_player_epilogue_01');

  addChain('v2_player_epilogue', chapter('00', '最后一位听众'), 'cg_true', [
    ['旁白', '故事本该在这里结束，画面却没有暗下。江临忽然回过头，视线越过天台、越过镜头，停在一直替他作出选择的人身上。', null],
    ['江临', '“原来一路把我们带到这里的人，不是我。”', null],
    ['林澄', '“{player}。这一次，换我们记住你的名字。”', 'lincheng'],
    ['唐砂', '“谢谢你没把任何一次失败当成废片。”', 'tangsha'],
    ['苏弥', '“谢谢你在声音停止以后，仍然没有断开。”', 'sumi'],
    ['顾晚晴', '“谢谢你救人的时候，也允许我们救你。”', 'guwanqing'],
    ['纪遥', '“名字被人回答，就不会消失。这条规则对屏幕外也有效。”', 'jiyao'],
    ['江朔', '“谢谢你，让零点之后真的有了明天。”', null],
    ['江临', '“晚安，{player}。下一次选择开始以前，先替我们好好生活。”', null]
  ], 'ending_true');
  setCgScene('v2_true_finale', 'cg_true');
  setCgScene('v2_player_epilogue', 'cg_true');

  nodes.ending_true = { type: 'ending', ending: 'true' };

  // V3 true route: Jiang Shuo identifies the player, deletes Jiang Lin from the
  // stabilized world, and is ultimately trapped inside the perfect 00:13 he chose.
  addChain('v3_true_awaken', chapter('06', '五次零点之后'), 'studio', [
    { speaker: '旁白', char: null, location: true, text: '第五段结局结束后，标题画面没有出现。我在直播间醒来，电子钟停在00:13。五件来自不同人生的物品并排放在控制台上。' },
    ['林澄', '“我记得五个你。”', 'lincheng'],
    ['唐砂', '“也记得五种明明已经发生、现在却不存在的明天。”', 'tangsha'],
    ['苏弥', '“本地时间只过去一秒，记忆却增加了五轮。”', 'sumi'],
    ['顾晚晴', '“有人一直把我们的结局保存在同一个地方。”', 'guwanqing'],
    ['纪遥', '“不是地方。是海。所有被覆盖的人生都沉在临海市下面。”', 'jiyao'],
    ['旁白', '旧电话自行亮起。屏幕上没有号码，只有八年前那通未接来电的时间。', null],
    ['江朔', '“江临，如果你听见这段话，不要来找我。”', null],
    ['我', '“这一次我接了。你把话说完。”', null],
    ['江朔', '“后半句不是说给你的。”', null],
    ['旁白', '所有按钮同时失效。江临仍站在画面中央，声音却被彻底切断。电话里的男人越过他，看向屏幕之外。', null]
  ], 'v3_player_contact_01');

  addChain('v3_player_contact', chapter('06', '世界之外'), 'studio', [
    ['江朔', '“{player}，你终于来了。”', null],
    ['江朔', '“第一轮，我以为江临突然变得勇敢。第三轮，我发现他的回答总比念头早零点零四秒。”', null],
    ['江朔', '“第五轮，纪遥念出了一个不属于临海市、却被每条时间线共同保存的名字。”', null],
    ['江朔', '“你不是这个世界的人。可每一次把他们从正确结局里拖出去的，都是你。”', null],
    ['旁白', '屏幕被黑色海面覆盖。海下亮着无数个停在最后一秒的房间，每个房间里都有人仍在等待下一次点击。', null],
    ['江朔', '“你们把它叫作周目。对留在那里的人来说，那是他们唯一活过的一生。”', null],
    ['江朔', '“我看过太多次告别。救下一个，另一个就会沉下去。修正一场灾难，下一场灾难只会换一个名字。”', null],
    ['江朔', '“所以我不再修正结局。我决定修正允许结局发生的世界。”', null]
  ], 'v3_player_contact_choice');

  nodes.v3_player_contact_choice = {
    type: 'choice', chapter: chapter('06', '世界之外'), bg: 'studio',
    prompt: '江临听不见。江朔正在等待屏幕前的你回答——',
    choices: [
      { label: '“正因为会失去，留下才有意义。”', hint: '承认痛苦，也拒绝删除真实发生过的人生', next: 'v3_contact_meaning_01', effect: { flags: { playerMeaning: true } } },
      { label: '“你无权替他们停止未来。”', hint: '拒绝由一个人决定所有人的安全', next: 'v3_contact_choice_01', effect: { flags: { playerFreedom: true } } }
    ]
  };

  addChain('v3_contact_meaning', chapter('06', '世界之外'), 'studio', [
    ['江朔', '“这是还没有失去一切的人，才说得出口的话。”', null],
    ['江朔', '“你愿意承受失去，是你的自由。可那些再也站不起来的人呢？你凭什么要求他们也把痛苦叫作意义？”', null],
    ['旁白', '他没有等待第二次回答。黑海开始上升，五条时间线同时被拖向00:13。', null]
  ], 'v3_zero_world_01');

  addChain('v3_contact_choice', chapter('06', '世界之外'), 'studio', [
    ['江朔', '“选择权只属于还有余力选择的人。”', null],
    ['江朔', '“我不需要所有人同意。医生阻止病人跳下去时，也不会先问他是否尊重痛苦。”', null],
    ['旁白', '他没有等待第二次回答。黑海开始上升，五条时间线同时被拖向00:13。', null]
  ], 'v3_zero_world_01');

  addChain('v3_zero_world', chapter('00', '没有失去的明天'), 'rooftop', [
    { speaker: '旁白', char: null, location: true, text: '清晨六点，临海市没有发生事故。桥梁完整，急诊室无人送达，档案馆没有失踪记录，电台收到的全是普通听众来电。' },
    ['林澄', '“今天的节目很顺利。”', 'lincheng'],
    ['旁白', '她说完，下意识把第二副耳机推向身边。座位是空的，她怔了两秒，又把耳机收回。', 'lincheng'],
    ['唐砂', '“来，合照。”', 'tangsha'],
    ['旁白', '照片里五个人都在笑，中央却留着一个无法解释的空位。唐砂试着裁掉，画面便重新向两侧裂开。', 'tangsha'],
    ['苏弥', '“频道配置错误。系统显示双人监听，实际只有一路声纹。”', 'sumi'],
    ['顾晚晴', '“值班表为什么空了一格？”', 'guwanqing'],
    ['纪遥', '“第六卷没有缺页。但我一直觉得，有一个名字还没念完。”', 'jiyao'],
    ['旁白', '她们都活着。所有危险都被修正。这个世界唯一不存在的人，是江临。', null],
    ['江朔', '“看见了吗，{player}？没有人死亡，也没有人必须牺牲。”', null],
    ['江朔', '“江临不是代价。他只是五条互相矛盾的人生里，最后一个需要被修正的错误。”', null]
  ], 'v3_erased_choice');

  nodes.v3_erased_choice = {
    type: 'choice', chapter: chapter('00', '没有失去的明天'), bg: 'rooftop',
    prompt: '系统中已经找不到江临。你仍然记得他的名字——',
    choices: [
      { label: '回答：“江临。”', hint: '即使系统判定查无此人', next: 'v3_erased_answer_01', effect: { flags: { answeredJiangLin: true } } }
    ]
  };

  addChain('v3_erased_answer', chapter('00', '查无此人'), 'rooftop', [
    ['系统', '“查无此人。”', null],
    ['旁白', '名字没有被接受，却穿过画面，在林澄的第二副耳机里化成一声极轻的呼吸。', null],
    ['林澄', '“刚才有人叫了一个名字。”', 'lincheng'],
    ['苏弥', '“不是音频输入。它来自系统之外。”', 'sumi'],
    ['纪遥', '“能被回答，就说明这个人并没有不存在。他只是被沉进了我们看不见的地方。”', 'jiyao'],
    ['唐砂', '“海。”', 'tangsha'],
    ['顾晚晴', '“那就去把他带回来。”', 'guwanqing']
  ], 'v3_recover_clues_01');

  addChain('v3_recover_clues', chapter('07', '请回答他的名字'), 'studio', [
    ['旁白', '五条时间线留下的东西开始同时回应。它们不是恋爱结局的纪念品，而是江临曾经存在过的五份证词。', null],
    ['林澄', '“耳机里有他的呼吸。他总在想逞强以前先吸一口气。”', 'lincheng'],
    ['唐砂', '“照片中央的空白不是背景。有人每次都站在那里，等我跑回镜头。”', 'tangsha'],
    ['苏弥', '“第三道声纹属于{player}。第二道被删除的，才是江临。”', 'sumi'],
    ['顾晚晴', '“空白病历不是无人需要抢救。是患者姓名被系统拿走了。”', 'guwanqing'],
    ['纪遥', '“五种人生不互相否定。它们共同证明，同一个人曾经五次选择留下。”', 'jiyao'],
    ['林澄', '“他在海里等不到自己的名字。我们下去。”', 'lincheng'],
    ['旁白', '没有人问由谁去。五个人同时握住纪遥铺开的红线，另一端系在电台仍亮着的第六路信号上。', null]
  ], 'v3_sea_entry_01');

  addChain('v3_sea_entry', chapter('07', '被覆盖的海'), 'street', [
    { speaker: '旁白', char: null, location: true, text: '午夜，临海市外海退去，露出一条由废弃对话框组成的路。每走一步，身后就有一个旧结局重新亮起。' },
    ['旁白', '海里有五个江临。一个守在直播间，一个站在断桥前，一个留在地下机房，一个倒在急诊灯下，一个被写进不存在的第六卷。', null],
    ['第一个江临', '“林澄已经得救。我留在这里没有关系。”', null],
    ['第二个江临', '“唐砂的照片里不需要再多一个人。”', null],
    ['第三个江临', '“单用户闭环更稳定。”', null],
    ['第四个江临', '“一个人换五个人，是合理结果。”', null],
    ['第五个江临', '“总要有人保管被忘记的名字。”', null],
    ['旁白', '他们都拥有江临的一部分记忆，也都相信自己留下，其他人才能幸福。真正的江临已经分不清哪一个念头属于自己。', null]
  ], 'v3_sea_choice');
  setCgScene('v3_sea_entry', 'cg_sea');

  nodes.v3_sea_choice = {
    type: 'choice', chapter: chapter('07', '被覆盖的海'), bg: 'street',
    prompt: '系统要求从五段人生中选出唯一真实的江临——',
    choices: [
      { label: '拒绝选择——回答全部五个江临', hint: '没有一段真实经历应该被当作错误删除', next: 'v3_sea_rescue_01', effect: { flags: { answeredAllJiangLin: true } } },
      { label: '让五位女主分别回答她们记得的江临', hint: '把定义江临的权利交还给共同经历过的人', next: 'v3_sea_rescue_01', effect: { flags: { sharedAnswer: true } } }
    ]
  };

  addChain('v3_sea_rescue', chapter('07', '把他捞回来'), 'street', [
    ['林澄', '“我记得那个明明害怕，却陪我把最后一段节目说完的人。”', 'lincheng'],
    ['唐砂', '“我记得那个知道照片会错，还是肯站进镜头的人。”', 'tangsha'],
    ['苏弥', '“我记得那个不符合最优模型，却始终没有断线的人。”', 'sumi'],
    ['顾晚晴', '“我记得那个救别人时，最后也学会把自己算进去的人。”', 'guwanqing'],
    ['纪遥', '“我记得江临。不是职位、样本或第六卷，是一个具体的人。”', 'jiyao'],
    ['旁白', '五个身影没有互相覆盖，而是在名字中重新拼合。海底最深处，江临睁开眼。', null],
    ['江临', '“别拉我。只要我留在这里，你们都会得到没有失去的明天。”', null],
    ['林澄', '“可那个明天里没有你。”', 'lincheng'],
    ['林澄', '“所以它不是我们的明天。”', 'lincheng'],
    ['旁白', '林澄跳进海里抓住他的手。唐砂抓住林澄，苏弥扣住唐砂的手腕，顾晚晴拉紧安全绳，纪遥把红线另一端递向屏幕。', null]
  ], 'v3_rescue_choice');
  setCgScene('v3_sea_rescue', 'cg_sea');

  nodes.v3_rescue_choice = {
    type: 'choice', chapter: chapter('07', '把他捞回来'), bg: 'street',
    prompt: '红线的最后一端，正在等待世界之外的回答——',
    choices: [
      { label: '“江临，回来。”', hint: '这一次不是替他选择，而是告诉他仍有人在等', next: 'v3_rescue_return_01', effect: { flags: { calledHimBack: true } } }
    ]
  };

  addChain('v3_rescue_return', chapter('07', '把他捞回来'), 'street', [
    ['旁白', '屏幕外的回答穿过红线。江临第一次听清那道陪伴了自己五次、却从未属于这个世界的声音。', null],
    ['江临', '“原来一直在我身后的人……是你。”', null],
    ['旁白', '他反手抓紧林澄。六个人同时向岸上用力，黑海裂开，所有被覆盖的时间线化成雨，从临海市上空重新落下。', null],
    ['江朔', '“你们把他带回来，然后呢？”', null],
    ['江朔', '“十年、二十年以后，你们仍会争吵、衰老、死亡。今天的胜利，不过是把告别推迟。”', null]
  ], 'v3_brothers_01');
  setCgScene('v3_rescue_return', 'cg_sea');

  addChain('v3_brothers', chapter('08', '八年前的未接来电'), 'archive', [
    ['我', '“八年前那通电话，你到底想说什么？”', null],
    ['江朔', '“我想告诉你，我终于找到一种不会再失去任何人的办法。”', null],
    ['我', '“所以你不是被困在这里。”', null],
    ['江朔', '“是我选择留下。那通电话也不是求救。”', null],
    ['江朔', '“你一直以为接起来就能救我。江临，我从来没有求你救我。”', null],
    ['旁白', '八年的愧疚在这一刻失去理由。江临没有如释重负，只觉得那八年第一次真正属于自己，而不是一通没接到的电话。', null],
    ['我', '“我们要走了。”', null],
    ['江朔', '“你不准备说服我？”', null],
    ['我', '“我找了你八年，不是为了把你变成我想要的样子。”', null],
    ['我', '“你可以不认同。但你不能替所有人决定永远停在这里。”', null],
    ['旁白', '江临转身。身后的发射机却再次亮起，江朔把手按上00:13的总闸。', null],
    ['江朔', '“只要时间还会带走一个人，我就不会停下。”', null]
  ], 'v3_final_battle_01');

  addChain('v3_final_battle', chapter('08', '最后一次修正'), 'studio', [
    ['旁白', '零点世界重新合拢。江朔试图冻结所有人的名字，但每条被覆盖的时间线都开始自行播报。', null],
    ['林澄', '“这里是FM 00:13。听见名字的人，请回答。”', 'lincheng'],
    ['唐砂', '“照片不是判决。拍过的人，全都真实存在。”', 'tangsha'],
    ['苏弥', '“将记忆拆分到所有接入者。没有单独的保管者。”', 'sumi'],
    ['顾晚晴', '“拒绝建立交换病床。这里没有任何人可以被合理删除。”', 'guwanqing'],
    ['纪遥', '“第六卷开放记录。让每个无主的名字拥有回答者。”', 'jiyao'],
    ['旁白', '临海市的热线从第一盏亮到数不清。每一声“我记得”都让一个人脱离零点世界。', null],
    ['江朔', '“关掉频道！”', null],
    ['我', '“你想要没有失去的世界。”', null],
    ['我', '“那就由你自己决定，要不要永远留在那里。”', null]
  ], 'v3_final_choice');

  nodes.v3_final_choice = {
    type: 'choice', chapter: chapter('08', '最后一次修正'), bg: 'studio',
    prompt: '最后只剩一个名字仍连接着零点世界——',
    choices: [
      { label: '回答江朔的名字，但不替他选择离开', hint: '承认他的存在，也让他承担自己的道路', next: 'v3_jiangshuo_end_01', effect: { flags: { answeredJiangShuo: true } } }
    ]
  };

  addChain('v3_jiangshuo_end', chapter('08', '永远的00:13'), 'archive', [
    ['旁白', '江朔的名字被回答，出口在他面前打开。出口外有清晨、衰老、迟到的道歉，以及所有无法保证的明天。', null],
    ['我', '“哥，你还要继续吗？”', null],
    ['江朔', '“当然。”', null],
    ['我', '“那这一次，是你自己的选择。”', null],
    ['旁白', '江临不再伸手。出口关闭，零点世界失去所有可以冻结的人，只剩江朔和永远不会向前跳动的00:13。', null],
    ['江朔', '“总有一天，你们会再次失去重要的人。”', null],
    ['江朔', '“到那一天，你会明白，留在零点的人不是我。”', null],
    ['江朔', '“是迟早会回来的你们。”', null],
    ['旁白', '他的声音被封存在最后一秒。没有悔悟，没有告别。江朔终于得到一个永远不会再失去任何东西的世界——因为那里已经没有任何东西可以拥有。', null]
  ], 'v3_epilogue_01');
  setCgScene('v3_jiangshuo_end', 'cg_zero');

  addChain('v3_epilogue', chapter('00', '零点之后'), 'cg_true', [
    ['旁白', '03:17重新开始流动。临海市的桥仍会老化，医院仍会迎来病人，照片仍可能褪色，人与人也终有一天会告别。', null],
    ['旁白', '但此刻，六个人回到电台。唐砂设置定时拍摄，苏弥困得靠住林澄，顾晚晴举起保温杯，纪遥把写满名字的新档案抱在怀里，江临站在她们中间。', null],
    ['林澄', '“FM 00:13最后一个问题。零点之后，你们想去哪里？”', 'lincheng'],
    ['我', '“先去看天亮。”', null],
    ['旁白', '快门亮起前，江临忽然没有按照任何选项行动。他转过身，越过镜头，看向一路陪他走过五种人生的人。', null],
    ['江临', '“一开始，是你替我选择。”', null],
    ['江临', '“后来，是你让我学会自己选择。”', null],
    ['江临', '“{player}，谢谢你，让我重新存在。”', null],
    ['江临', '“接下来的人生，我会自己走。你也要回到你的世界，完成属于你的选择。”', null],
    ['旁白', '唐砂从相机旁跑回五个人身边。江临最后一次向屏幕伸出手，又在快门落下前收回，转身站进属于他的明天。', null],
    ['音效', '咔嚓。', null],
    ['林澄', '“这里是FM 00:13。零点之后，天会亮。”', 'lincheng']
  ], 'ending_true');
  setCgScene('v3_epilogue', 'cg_true');

  // Expression direction is metadata, so the renderer can lazy-load only the
  // variant required by the current line. Event-CG scenes remain portrait-free.
  const expressionDirection = {
    lc: { char: 'lincheng', open: 'serious', crisis: ['serious', 'sad'], resonance: ['shy', 'default'], normal: 'sad' },
    ts: { char: 'tangsha', open: 'serious', crisis: ['serious', 'sad'], resonance: ['shy', 'default'], normal: 'sad' },
    sm: { char: 'sumi', open: 'focused', daily: 'smile', crisis: ['focused', 'sad'], resonance: ['shy', 'smile'], normal: 'sad' },
    gw: { char: 'guwanqing', open: 'worried', daily: 'teasing', crisis: ['serious_open', 'worried'], resonance: ['shy', 'teasing'], normal: 'worried' },
    jy: { char: 'jiyao', open: 'serious', daily: 'mischief', crisis: ['serious', 'sad'], resonance: ['shy', 'mischief'], normal: 'sad' }
  };

  Object.entries(expressionDirection).forEach(([route, direction]) => {
    const routeLines = Object.entries(nodes).filter(([id, node]) =>
      id.startsWith(`v2_${route}_`) && node.type === 'line' && node.char === direction.char && node.bg && !node.bg.startsWith('cg_'));
    const phaseLines = phase => routeLines.filter(([id]) => id.includes(`_${phase}_`));

    for (const [id, node] of routeLines) {
      if (id.includes('_open_')) node.expression = direction.open;
      else if (!id.includes('_crisis_') && !id.includes('_resonance_') && !id.includes('_normal_') && direction.daily) node.expression = direction.daily;
    }

    for (const phase of ['crisis', 'resonance']) {
      const lines = phaseLines(phase);
      lines.forEach(([, node], index) => {
        const pair = direction[phase];
        node.expression = pair[index < Math.ceil(lines.length / 2) ? 0 : 1];
      });
    }
    phaseLines('normal').forEach(([, node]) => { node.expression = direction.normal; });
  });
})();
