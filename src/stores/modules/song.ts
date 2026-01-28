import { defineStore } from 'pinia'
import type { Song, PlayMode } from '@/types/player'
import { usePlayer } from '@/hooks/usePlayer.ts'
import { formatProgress } from '@/utils/format.ts'
import { getThemeColor, type RGB,normalizeThemeColor } from '@/utils/themeColor'
// 播放模式图标 SVG 常量
const PLAY_MODE_ICONS = {
  sequence: `<svg t="1729340192401" class="icon" viewBox="0 0 1152 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9608" width="20" height="20">
  <path d="M0 134.726775h904.001993v129.115815H0zM0 508.238107h904.001993v129.115816H0zM0 894.629141h904.001993v129.243337H0z" p-id="9609" fill="#e6e6e6"></path>
  <path d="M1147.696139 263.84259h-258.359153V3.761893M1147.696139 637.353923h-258.359153V377.273225M1147.696139 1023.936239h-258.359153V763.855542" p-id="9610" fill="#e6e6e6"></path>
</svg>`,
  random: `<svg t="1731052051779" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4278" width="20" height="20">
  <path d="M753.564731 337.471035c-45.8697 0-160.259984 113.849978-243.789399 194.548928C383.134027 654.383848 263.508509 773.284865 167.764911 773.284865l-58.892295 0c-24.068162 0-43.581588-19.526729-43.581588-43.581588s19.513426-43.581588 43.581588-43.581588l58.892295 0c60.504002 0 183.002964-121.68134 281.432741-216.784348 119.79641-115.744117 223.254713-219.029482 304.368102-219.029482l56.209186 0-59.641355-57.828057c-17.033955-16.993023-17.060561-42.902112-0.057305-59.927881 17.002232-17.030885 44.596707-17.064654 61.631686-0.065492l134.207631 133.874033c8.192589 8.172123 12.794397 19.238157 12.794397 30.803563 0 11.564383-4.601808 22.604834-12.794397 30.776957L811.706943 461.72599c-8.505721 8.486278-19.646456 12.522198-30.78719 12.522198-11.166317 0-22.333658-4.676509-30.844495-13.199627-17.003256-17.025769-16.975627-45.432749 0.057305-62.425771l59.641355-61.151755L753.564731 337.471035zM811.706943 561.66105c-17.034978-16.999163-44.629453-16.972557-61.631686 0.058328-17.003256 17.024745-16.975627 46.257533 0.057305 63.250556l59.641355 61.150732-56.209186 0c-35.793204 0-95.590102-52.946886-154.87637-108.373243-17.576307-16.435321-45.161572-16.3422-61.594847 1.226944-16.444531 17.568121-15.523555 46.393633 2.053776 62.823837 90.322122 84.458577 151.246703 131.484613 214.417441 131.484613l56.209186 0-59.641355 57.824987c-17.033955 16.993023-17.060561 43.736107-0.057305 60.761875 8.511861 8.523117 19.678178 12.369725 30.844495 12.369725 11.140735 0 22.281469-4.453429 30.78719-12.939707L945.914574 757.311055c8.192589-8.173147 12.794397-19.315928 12.794397-30.881334 0-11.564383-4.601808-22.682605-12.794397-30.855752L811.706943 561.66105zM108.871593 337.471035l58.892295 0c45.932122 0 114.40154 58.455343 168.915108 107.942431 8.352225 7.576559 18.832927 12.140505 29.29214 12.140505 11.852956 0 23.673166-4.394077 32.270984-13.857613 16.182564-17.807574 14.859429-46.823422-2.958378-62.998823-85.247546-77.381391-156.561755-130.388652-227.519854-130.388652l-58.892295 0c-24.068162 0-43.581588 19.526729-43.581588 43.581588S84.804455 337.471035 108.871593 337.471035z" p-id="4279" fill="#e6e6e6"></path>
</svg>`,
  loop: `<svg t="1731052119224" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8348" width="20" height="20">
  <path d="M192 789.333333a21.24 21.24 0 0 1-12.8-4.28 344.513333 344.513333 0 0 1-99.333333-118A341.246667 341.246667 0 0 1 384 170.666667h256q6.36 0 12.733333 0.233333l-49.153333-49.146667a21.333333 21.333333 0 0 1 30.173333-30.173333l85.333334 85.333333a21.333333 21.333333 0 0 1 0 30.173334l-85.333334 85.333333a21.333333 21.333333 0 0 1-30.173333-30.173333l48.666667-48.666667Q646.126667 213.333333 640 213.333333H384c-164.666667 0-298.666667 134-298.666667 298.666667 0 94.833333 43.546667 181.933333 119.48 238.966667A21.333333 21.333333 0 0 1 192 789.333333z m228.433333 143.06a21.333333 21.333333 0 0 0 0-30.173333l-49.153333-49.146667q6.366667 0.233333 12.733333 0.233334H640a341.46 341.46 0 0 0 304.146667-496.42 344.513333 344.513333 0 0 0-99.333334-118 21.333333 21.333333 0 1 0-25.626666 34.113333C895.12 330.066667 938.666667 417.166667 938.666667 512c0 164.666667-134 298.666667-298.666667 298.666667H384q-6.12 0-12.246667-0.246667l48.666667-48.666667a21.333333 21.333333 0 0 0-30.173333-30.173333l-85.333334 85.333333a21.333333 21.333333 0 0 0 0 30.173334l85.333334 85.333333a21.333333 21.333333 0 0 0 30.173333 0zM554.666667 618.666667V405.333333a21.333333 21.333333 0 0 0-21.333334-21.333333h-42.666666a21.333333 21.333333 0 0 0 0 42.666667h21.333333v192a21.333333 21.333333 0 0 0 42.666667 0z" fill="#e6e6e6" p-id="8349"></path>
</svg>`,
} as const

// 播放模式配置
const PLAY_MODES: readonly PlayMode[] = [
  { type: 'sequence', label: '顺序播放' },
  { type: 'random', label: '随机播放' },
  { type: 'loop', label: '单曲循环' },
] as const


export const useSongStore = defineStore('song', {
  state: () => ({
    //播放列表
    playList: [
      {
        "name": "泡沫（Beyonce）",
        "mainTitle": "泡沫",
        "additionalTitle": "（Beyonce）",
        "id": 3340664978,
        "pst": 0,
        "t": 0,
        "ar": [
          {
            "id": 121604391,
            "name": "叶芷涵",
            "tns": [],
            "alias": []
          },
          {
            "id": 121656070,
            "name": "裤裤",
            "tns": [],
            "alias": []
          }
        ],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": "",
        "fee": 8,
        "v": 41,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 358817432,
          "name": "泡沫（Beyonce）",
          "picUrl": "https://p3.music.126.net/pa1a6LsLgTmplkjv4pLlsw==/109951172613344898.jpg",
          "tns": [],
          "pic_str": "109951172613344898",
          "pic": 109951172613344900
        },
        "dt": 247719,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 9911085,
          "vd": -3103,
          "sr": 48000
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 5946669,
          "vd": -490,
          "sr": 48000
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 3964461,
          "vd": 1163,
          "sr": 48000
        },
        "sq": {
          "br": 828871,
          "fid": 0,
          "size": 25670555,
          "vd": -3096,
          "sr": 48000
        },
        "hr": null,
        "a": null,
        "cd": "01",
        "no": 1,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 0,
        "s_id": 0,
        "mark": 17179869184,
        "originCoverType": 2,
        "originSongSimpleData": {
          "songId": 233931,
          "name": "泡沫",
          "artists": [
            {
              "id": 7763,
              "name": "G.E.M.邓紫棋"
            }
          ],
          "albumMeta": {
            "id": 23497,
            "name": "Xposed"
          }
        },
        "tagPicList": null,
        "resourceState": true,
        "version": 7,
        "songJumpInfo": null,
        "entertainmentTags": null,
        "awardTags": null,
        "displayTags": null,
        "markTags": [],
        "single": 0,
        "noCopyrightRcmd": null,
        "mv": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 0,
        "publishTime": 0
      },
      {
        name: '忽远忽近',
        id: 2045111116,
        pst: 0,
        t: 0,
        ar: [
          {
            id: 31148973,
            name: '王唯一（九姨太）',
            tns: [],
            alias: [],
          },
        ],
        alia: [],
        pop: 100,
        st: 0,
        rt: '',
        fee: 1,
        v: 9,
        crbt: null,
        cf: '',
        al: {
          id: 165079720,
          name: '忽远忽近',
          picUrl: 'https://p2.music.126.net/dfaMg_Qzdl3yl7zo3eA7Cg==/109951168593171893.jpg',
          tns: [],
          pic_str: '109951168593171893',
          pic: 109951168593171890,
        },
        dt: 206933,
        h: {
          br: 320000,
          fid: 0,
          size: 8280045,
          vd: -52970,
          sr: 48000,
        },
        m: {
          br: 192000,
          fid: 0,
          size: 4968045,
          vd: -50360,
          sr: 48000,
        },
        l: {
          br: 128000,
          fid: 0,
          size: 3312045,
          vd: -48702,
          sr: 48000,
        },
        sq: {
          br: 974460,
          fid: 0,
          size: 25206102,
          vd: -53095,
          sr: 48000,
        },
        hr: {
          br: 1744269,
          fid: 0,
          size: 45118548,
          vd: -53056,
          sr: 48000,
        },
        a: null,
        cd: '01',
        no: 1,
        rtUrl: null,
        ftype: 0,
        rtUrls: [],
        djId: 0,
        copyright: 0,
        s_id: 0,
        mark: 17716748288,
        originCoverType: 1,
        originSongSimpleData: null,
        tagPicList: null,
        resourceState: true,
        version: 9,
        songJumpInfo: null,
        entertainmentTags: null,
        awardTags: null,
        single: 0,
        noCopyrightRcmd: null,
        mv: 0,
        mst: 9,
        cp: 7001,
        rtype: 0,
        rurl: null,
        publishTime: 0,
      },
      {
        "name": "罗生门（Follow）",
        "mainTitle": "罗生门",
        "additionalTitle": "（Follow）",
        "id": 1456890009,
        "pst": 0,
        "t": 0,
        "ar": [
          {
            "id": 33259235,
            "name": "梨冻紧",
            "tns": [],
            "alias": []
          },
          {
            "id": 13112601,
            "name": "Wiz_H张子豪",
            "tns": [],
            "alias": []
          }
        ],
        "alia": [],
        "pop": 100,
        "st": 0,
        "rt": "",
        "fee": 8,
        "v": 73,
        "crbt": null,
        "cf": "",
        "al": {
          "id": 91237927,
          "name": "罗生门（Follow）",
          "picUrl": "https://p3.music.126.net/yN1ke1xYMJ718FiHaDWtYQ==/109951165076380471.jpg",
          "tns": [],
          "pic_str": "109951165076380471",
          "pic": 109951165076380460
        },
        "dt": 243754,
        "h": {
          "br": 320000,
          "fid": 0,
          "size": 9752735,
          "vd": -48129,
          "sr": 48000
        },
        "m": {
          "br": 192000,
          "fid": 0,
          "size": 5851679,
          "vd": -45527,
          "sr": 48000
        },
        "l": {
          "br": 128000,
          "fid": 0,
          "size": 3901151,
          "vd": -43878,
          "sr": 48000
        },
        "sq": {
          "br": 922449,
          "fid": 0,
          "size": 28106454,
          "vd": -48126,
          "sr": 48000
        },
        "hr": {
          "br": 1692069,
          "fid": 0,
          "size": 51556278,
          "vd": -48120,
          "sr": 48000
        },
        "a": null,
        "cd": "01",
        "no": 1,
        "rtUrl": null,
        "ftype": 0,
        "rtUrls": [],
        "djId": 0,
        "copyright": 0,
        "s_id": 0,
        "mark": 17716748352,
        "originCoverType": 1,
        "originSongSimpleData": null,
        "tagPicList": null,
        "resourceState": true,
        "version": 39,
        "songJumpInfo": null,
        "entertainmentTags": null,
        "awardTags": null,
        "displayTags": null,
        "markTags": [],
        "single": 0,
        "noCopyrightRcmd": null,
        "mv": 0,
        "rtype": 0,
        "rurl": null,
        "mst": 9,
        "cp": 0,
        "publishTime": 0
      }
    ],
    //播放状态
    playStatus: false as boolean,
    //当前播放歌曲的索引
    currentIndex: 0 as number,
    // 在随机播放列表中的索引（切换模式时用来保持同步）
    currentSongInShuffledIndex: 0,
    // 当前播放歌曲
    currentSong: {} as Song,
    // 当前歌曲的总时长
    duration: 0,
    // 格式化后的当前播放时间
    formatCurrentTime: '00:00',
    // 播放时长进度
    currentTime: 0,
    // 播放进度条进度
    playProgressBarRate: 0,
    // 音量
    volume: 50,
    // 播放模式
    playMode: PLAY_MODES[0],
    // 当前歌曲的url
    songUrl: '',
    // 歌曲解析的歌词
    lyric: [],
    // 当前歌曲是否被收藏
    isFavorite: false,
    // 随机播放的列表
    shuffledPlayList: [],
    // 当前时间播放展示的歌词
    currentTimeLyric: [],
    // 当前时间记录的歌词
    currenLastLy: [],
    // 详情页的展示状态
    songDetailsDisplay: false,
    // 播放列表的展示状态
    playListDisplay: false,
    // 收藏状态
    hearted: false,
    // 是否需要同步音频播放时间（用于外部跳转）
    shouldSyncAudioTime: false,
    themeRGB: [30, 30, 30] as RGB,
    cache: {} as Record<string, RGB>
  }),

  getters: {
    /**
     * 返回当前播放模式的图标 SVG
     */
    playModeIcon(): string {
      return PLAY_MODE_ICONS[this.playMode.type] || PLAY_MODE_ICONS.sequence
    },

    /**
     * 检查播放列表是否为空
     */
    isPlayListEmpty(): boolean {
      return this.playList.length === 0
    },

    /**
     * 获取当前播放列表（根据播放模式返回对应列表）
     */
    activePlayList(): Song[] {
      return this.playMode.type === 'random' ? this.shuffledPlayList : this.playList
    },
  },

  actions: {
    /**
     * 切换到播放列表中的下一首歌曲，根据播放模式选择对应的逻辑
     * @param player - 用于播放歌曲的回调函数，接收歌曲 ID 和当前索引作为参数
     */
    nextSong(player: (id: number, currentIndex: number) => void): void {
      if (this.isPlayListEmpty) {
        console.warn('播放列表为空，无法切换下一首')
        return
      }

      switch (this.playMode.type) {
        case 'sequence':
          this.currentIndex = (this.currentIndex + 1) % this.playList.length
          player(this.playList[this.currentIndex].id, this.currentIndex)
          break
        case 'random':
          if (this.shuffledPlayList.length === 0) {
            this.initializePlayList()
          }
          this.currentIndex = (this.currentIndex + 1) % this.shuffledPlayList.length
          player(this.shuffledPlayList[this.currentIndex].id, this.currentIndex)
          break
        case 'loop':
          player(this.playList[this.currentIndex].id, this.currentIndex)
          break
        default:
          console.warn('未知播放模式:', this.playMode.type)
          break
      }
    },

    /**
     * 切换到播放列表中的上一首歌曲，根据播放模式选择对应的逻辑
     * @param player - 用于播放歌曲的回调函数，接收歌曲 ID 和当前索引作为参数
     */
    prevSong(player: (id: number, currentIndex: number) => void): void {
      if (this.isPlayListEmpty) {
        console.warn('播放列表为空，无法切换上一首')
        return
      }

      switch (this.playMode.type) {
        case 'sequence':
          this.currentIndex = (this.currentIndex - 1 + this.playList.length) % this.playList.length
          player(this.playList[this.currentIndex].id, this.currentIndex)
          break
        case 'random':
          if (this.shuffledPlayList.length === 0) {
            this.initializePlayList()
          }
          this.currentIndex =
            (this.currentIndex - 1 + this.shuffledPlayList.length) % this.shuffledPlayList.length
          player(this.shuffledPlayList[this.currentIndex].id, this.currentIndex)
          break
        case 'loop':
          player(this.playList[this.currentIndex].id, this.currentIndex)
          break
        default:
          console.warn('未知播放模式:', this.playMode.type)
          break
      }
    },

    /**
     * 根据当前播放模式初始化播放列表，并正确设置播放索引
     */
    initializePlayList(): void {
      if (this.isPlayListEmpty) {
        console.warn('播放列表为空，无法初始化')
        return
      }

      const { getRandomPlayList } = usePlayer()
      if (this.playMode.type === 'random') {
        this.currentSongInShuffledIndex = this.currentIndex
        this.shuffledPlayList = getRandomPlayList()
        this.currentIndex = 0
      } else {
        // 如果切换到顺序播放，使用顺序播放列表
        this.shuffledPlayList = []
        this.currentIndex = this.currentSongInShuffledIndex
      }
    },

    /**
     * 切换当前播放模式（顺序播放、随机播放、单曲循环），并重新初始化播放列表
     */
    changePlayMode(): void {
      const currentIndex = PLAY_MODES.findIndex((mode) => mode.type === this.playMode.type)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % PLAY_MODES.length
      this.playMode = PLAY_MODES[nextIndex]
      this.initializePlayList()
    },

    /*
    *获取歌曲封面主题色
     */
    async setThemeByCover(coverUrl: string) {
      if (!coverUrl) return

      // 命中缓存，直接用
      if (this.cache[coverUrl]) {
        this.themeRGB = this.cache[coverUrl]
        return
      }

      const rgb = await getThemeColor(coverUrl)
      const safeRGB = normalizeThemeColor(rgb)
      this.themeRGB = safeRGB
      this.cache[coverUrl] = safeRGB
    },
    /**
     * 重置播放状态
     */
    resetPlayState(): void {
      this.playStatus = false
      this.currentTime = 0
      this.formatCurrentTime = '00:00'
      this.playProgressBarRate = 0
      this.duration = 0
    },

    /**
     * 跳转到指定时间播放
     * @param time - 要跳转的时间（秒）
     */
    seekToTime(time: number): void {
      this.currentTime = time
      this.formatCurrentTime = formatProgress(time)
      this.playProgressBarRate = time
      this.shouldSyncAudioTime = true
    },
  },
})
