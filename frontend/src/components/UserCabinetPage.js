import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Stack,
  LinearProgress,
  Fade,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputBase,
  alpha,
  styled,
  useTheme,
  useMediaQuery,
  PaperProps,
  CardProps,
  ButtonProps,
  DialogProps,
  TypographyProps,
  BoxProps,
  Container,
  Skeleton,
  Backdrop,
  Modal,
  Fab,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Edit,
  Save,
  Close,
  Delete,
  Visibility,
  VisibilityOff,
  Home,
  ShoppingCart,
  Favorite,
  History,
  Settings,
  Notifications,
  ExitToApp,
  Add,
  Remove,
  Check,
  Clear,
  ExpandMore,
  ChevronRight,
  Lock,
  Security,
  AccountCircle,
  Dashboard,
  Store,
  LocalShipping,
  Payment,
  Receipt,
  Star,
  StarBorder,
  RateReview,
  QuestionAnswer,
  Support,
  Language,
  Palette,
  VolumeUp,
  VolumeOff,
  Wifi,
  WifiOff,
  BatteryAlert,
  NotificationsActive,
  NotificationsOff,
  Schedule,
  Event,
  Timeline,
  TrendingUp,
  TrendingDown,
  Assessment,
  BarChart,
  PieChart,
  ShowChart,
  AttachMoney,
  Euro,
  CurrencyPound,
  CurrencyRuble,
  GpsFixed,
  LocationOn,
  MyLocation,
  Directions,
  Map,
  Place,
  Flag,
  Public,
  Translate,
  CheckCircle,
  Error,
  Warning,
  Info,
  Help,
  Feedback,
  BugReport,
  Build,
  Engineering,
  Science,
  Psychology,
  AutoFixHigh,
  AutoAwesome,
  EmojiEvents,
  MilitaryTech,
  WorkspacePremium,
  Verified,
  VerifiedUser,
  AdminPanelSettings,
  VpnKey,
  Fingerprint,
  Face,
  FaceRetouchingNatural,
  FaceRetouchingOff,
  Man,
  Woman,
  Transgender,
  Cake,
  CalendarToday,
  EventAvailable,
  EventBusy,
  Today,
  DateRange,
  AccessTime,
  Alarm,
  Timer,
  Stop,
  PlayArrow,
  Pause,
  Forward10,
  Replay10,
  SkipNext,
  SkipPrevious,
  Repeat,
  RepeatOne,
  Shuffle,
  VolumeDown,
  VolumeMute,
  Equalizer,
  GraphicEq,
  Audiotrack,
  MusicNote,
  LibraryMusic,
  Radio,
  Podcasts,
  Headphones,
  Speaker,
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  PhotoCamera,
  CameraAlt,
  CameraRoll,
  PhotoLibrary,
  Image,
  ImageNotSupported,
  BrokenImage,
  CloudUpload,
  CloudDownload,
  Cloud,
  CloudQueue,
  CloudDone,
  CloudSync,
  CloudOff,
  Sync,
  SyncProblem,
  SyncDisabled,
  Refresh,
  Cached,
  Update,
  SystemUpdate,
  SystemUpdateAlt,
  GetApp,
  Publish,
  FileUpload,
  FileDownload,
  Archive,
  Unarchive,
  Folder,
  FolderOpen,
  FolderShared,
  CloudFolder,
  CreateNewFolder,
  DriveFileMove,
  DriveFileRename,
  DriveFolderUpload,
  SdCard,
  SdCardAlert,
  SimCard,
  SimCardAlert,
  Memory,
  Storage,
  Computer,
  Laptop,
  LaptopMac,
  LaptopWindows,
  DesktopMac,
  DesktopWindows,
  Tablet,
  TabletMac,
  TabletAndroid,
  PhoneAndroid,
  PhoneIphone,
  Watch,
  WatchLater,
  WatchOff,
  Timer3,
  Timer10,
  HourglassEmpty,
  HourglassFull,
  HourglassTop,
  HourglassBottom,
  AccessAlarm,
  AccessTimeFilled,
  AlarmAdd,
  AlarmOn,
  AlarmOff,
  Bedtime,
  BedtimeOff,
  Nightlight,
  NightlightRound,
  WbSunny,
  WbTwilight,
  WbCloudy,
  AcUnit,
  Balcony,
  BeachAccess,
  Business,
  Casino,
  Category,
  ChildCare,
  Elderly,
  EmojiFoodBeverage,
  EmojiNature,
  EmojiObjects,
  EmojiPeople,
  EmojiSymbols,
  EmojiTransportation,
  EmojiFlags,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  Mood,
  MoodBad,
  AddReaction,
  RemoveRedEye,
  VisibilityOff as Invisible,
  Visibility as Visible,
  Search,
  SearchOff,
  FilterList,
  FilterListOff,
  Sort,
  SortByAlpha,
  ImportExport,
  SwapVert,
  SwapHoriz,
  CompareArrows,
  TrendingFlat,
  KeyboardArrowUp,
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  ExpandLess,
  UnfoldMore,
  UnfoldLess,
  OpenInFull,
  CloseFullscreen,
  Fullscreen,
  FullscreenExit,
  Minimize,
  Maximize,
  OpenInNew,
  Launch,
  Link,
  LinkOff,
  InsertLink,
  ContentCopy,
  ContentPaste,
  Cut,
  CopyAll,
  SelectAll,
  FormatBold,
  FormatItalic,
  FormatUnderline,
  FormatStrikethrough,
  FormatColorText,
  FormatColorFill,
  FormatPaint,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatIndentIncrease,
  FormatIndentDecrease,
  FormatLineSpacing,
  FormatSize,
  FormatClear,
  TextFields,
  Title,
  Functions,
  Subscript,
  Superscript,
  VerticalAlignTop,
  VerticalAlignCenter,
  VerticalAlignBottom,
  HorizontalRule,
  BorderAll,
  BorderClear,
  BorderOuter,
  BorderInner,
  BorderTop,
  BorderBottom,
  BorderLeft,
  BorderRight,
  BorderStyle,
  Margin,
  Padding,
  TableChart,
  TableRows,
  TableColumns,
  ViewColumn,
  ViewModule,
  ViewList,
  ViewQuilt,
  ViewComfy,
  ViewCompact,
  ViewStream,
  ViewHeadline,
  ViewAgenda,
  ViewWeek,
  ViewDay,
  ViewArray,
  ViewCarousel,
  ViewSidebar,
  Tune,
  TuneOutlined,
  Adjust,
  Straighten,
  Crop,
  CropFree,
  CropLandscape,
  CropPortrait,
  CropSquare,
  CropRotate,
  RotateLeft,
  RotateRight,
  Rotate90DegreesCw,
  Rotate90DegreesCcw,
  Flip,
  FlipToFront,
  FlipToBack,
  Layers,
  LayersClear,
  PhotoSizeSelectActual,
  PhotoSizeSelectLarge,
  PhotoSizeSelectSmall,
  GridOn,
  GridOff,
  TableView,
  ViewInAr,
  ViewInArOutlined,
  ViewInArNew,
  ThreeDRotation,
  Panorama,
  PanoramaFishEye,
  PanoramaHorizontal,
  PanoramaVertical,
  PanoramaWideAngle,
  PanoramaVerticalSelect,
  PanoramaHorizontalSelect,
  PanoramaWideAngleSelect,
  PanoramaFishEyeSelect,
  Vrpano,
  VrpanoOutlined,
  WbIncandescent,
  WbIridescent,
  WbShade,
  WbSunnyOutlined,
  WbCloudyOutlined,
  WbTwilightOutlined,
  WbIncandescentOutlined,
  WbIridescentOutlined,
  WbShadeOutlined,
  WbAuto,
  WbAutoOutlined,
  AutoAwesomeMosaic,
  AutoAwesomeMotion,
  AutoFixNormal,
  AutoFixOff,
  AutoGraph,
  AutoMode,
  AutoStories,
  AutoDelete,
  ColorLens,
  PaletteOutlined,
  Brush,
  FormatColorReset,
  Colorize,
  InvertColors,
  InvertColorsOff,
  InvertColorsOutlined,
  Opacity,
  Gradient,
  LinearScale,
  Scale,
  StraightenOutlined,
  CropOutlined,
  Filter,
  FilterAlt,
  FilterAltOutlined,
  FilterBAndW,
  FilterBAndWOutlined,
  FilterCenterFocus,
  FilterCenterFocusOutlined,
  FilterDrama,
  FilterDramaOutlined,
  FilterFrames,
  FilterFramesOutlined,
  FilterHdr,
  FilterHdrOutlined,
  FilterNone,
  FilterNoneOutlined,
  FilterTiltShift,
  FilterTiltShiftOutlined,
  FilterVintage,
  FilterVintageOutlined,
  BlurOn,
  BlurOff,
  BlurCircular,
  BlurLinear,
  BlurOffOutlined,
  BlurOnOutlined,
  BlurCircularOutlined,
  BlurLinearOutlined,
  Grain,
  GrainOutlined,
  Looks,
  Looks3,
  Looks4,
  Looks5,
  Looks6,
  LooksOne,
  LooksTwo,
  LooksOutlined,
  Looks3Outlined,
  Looks4Outlined,
  Looks5Outlined,
  Looks6Outlined,
  LooksOneOutlined,
  LooksTwoOutlined,
  MonochromePhotos,
  MonochromePhotosOutlined,
  Photo,
  PhotoOutlined,
  PhotoAlbum,
  PhotoAlbumOutlined,
  PhotoCameraOutlined,
  PhotoFilter,
  PhotoFilterOutlined,
  PhotoLibraryOutlined,
  PhotoSizeSelectActualOutlined,
  PhotoSizeSelectLargeOutlined,
  PhotoSizeSelectSmallOutlined,
  PictureAsPdf,
  PictureAsPdfOutlined,
  Slideshow,
  SlideshowOutlined,
  Collections,
  CollectionsOutlined,
  CollectionsBookmark,
  CollectionsBookmarkOutlined,
  Videoshow,
  VideoshowOutlined,
  VideoLibrary,
  VideoLibraryOutlined,
  VideoSettings,
  VideoSettingsOutlined,
  VideoStable,
  VideoStableOutlined,
  VideoCall,
  VideoCallOutlined,
  VideoLabel,
  VideoLabelOutlined,
  VideoFile,
  VideoFileOutlined,
  VideoCameraBack,
  VideoCameraBackOutlined,
  VideoCameraFront,
  VideoCameraFrontOutlined,
  VideoChat,
  VideoChatOutlined,
  Edit as EditIcon,
  DeleteForever as DeleteForeverIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarTodayIcon,
  BarChart as BarChartIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationsIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Settings as SettingsIcon,
  ExitToApp as ExitToAppIcon,
  Google,
  Facebook,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, Navigate } from 'react-router-dom';
import { getImageUrl, API_BASE_URL } from '../config';
import { getTranslatedName } from '../utils/translationUtils';
import LazyImage from './LazyImage';
import ProductCard from './ProductCard';
import ElegantProductCarousel from './ElegantProductCarousel';

// Новый компонент личного кабинета
function UserCabinetPage({ user, handleLogout, wishlist, handleWishlistToggle, cart, handleAddToCart, handleChangeCartQuantity, onEditProduct, handleUserUpdate, handleOpenReviewForm }) {
    const { t } = useTranslation();
    const [selectedSection, setSelectedSection] = useState('myprofile');
    
      // Проверяем флаг для открытия вкладки уведомлений при загрузке
    React.useEffect(() => {
      const openNotificationsTab = localStorage.getItem('openNotificationsTab');
      if (openNotificationsTab === 'true') {
        setSelectedSection('notifications');
        localStorage.removeItem('openNotificationsTab');
      }
    }, []);
    
    // Обнуляем счетчик уведомлений при переходе на страницу уведомлений
    React.useEffect(() => {
      if (selectedSection === 'notifications') {
        // Обнуляем счетчик в AppBar
        window.dispatchEvent(new CustomEvent('clearNotificationsCount'));
        
        // Устанавливаем флаг, что счетчик был обнулен
        localStorage.setItem('notificationsCleared', 'true');
        localStorage.setItem('notificationsClearedAt', Date.now().toString());
        localStorage.setItem('notificationsCountAtClear', '0');
      }
    }, [selectedSection]);
    const [localWishlist, setLocalWishlist] = useState(wishlist || []);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [localViewed, setLocalViewed] = useState([]);
    const [clearViewedDialogOpen, setClearViewedDialogOpen] = useState(false);
    const [deleteProfileDialogOpen, setDeleteProfileDialogOpen] = useState(false);
    const [profileForm, setProfileForm] = useState({
      name: '',
      surname: '',
      email: '',
      phone: '',
    });
    const [profileData, setProfileData] = useState(null);
    const [profileSaved, setProfileSaved] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    
    // Состояния для вкладки "Настройки авторизации"
    const [passwordForm, setPasswordForm] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSaved, setPasswordSaved] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false,
      confirm: false
    });
    
    // Хуки для уведомлений (в начало UserCabinetPage)
    const [notifications, setNotifications] = useState([]);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [errorNotifications, setErrorNotifications] = useState('');
    const [submittedReviews, setSubmittedReviews] = useState(new Set());
    const [completedNotifications, setCompletedNotifications] = useState(new Set());
    
    // Хуки для заказов
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    
    // Хуки для отзывов
    const [userReviews, setUserReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    
    // Проверяем localStorage для активной вкладки при загрузке
    useEffect(() => {
      const activeTab = localStorage.getItem('activeProfileTab');
      const selectedSectionFromMenu = localStorage.getItem('selectedProfileSection');
      const skipReload = localStorage.getItem('skipReload');
      
      // Приоритет: сначала проверяем выбранную секцию из контекстного меню
      if (selectedSectionFromMenu && ['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(selectedSectionFromMenu)) {
        setSelectedSection(selectedSectionFromMenu);
        localStorage.removeItem('selectedProfileSection');
        return;
      }
      
          // Затем проверяем активную вкладку
      if (activeTab && ['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(activeTab)) {
        setSelectedSection(activeTab);
        // Очищаем localStorage после использования
        localStorage.removeItem('activeProfileTab');
        
        // Если это обновление с перезагрузкой, очищаем флаг
        if (skipReload) {
          localStorage.removeItem('skipReload');
          // Принудительно загружаем уведомления при переключении на вкладку
          if (activeTab === 'notifications' && user) {
            let ignore = false;
            setLoadingNotifications(true);
            setErrorNotifications('');
            fetch(`${API_BASE_URL}/api/profile/notifications`, {
              headers: { 'Authorization': `Bearer ${user.token}` }
            })
              .then(res => {
                if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
                return res.json();
              })
              .then(data => {
                if (!ignore) setNotifications(Array.isArray(data) ? data : []);
              })
              .catch(e => { if (!ignore) setErrorNotifications(e.message); })
              .finally(() => { if (!ignore) setLoadingNotifications(false); });
            return () => { ignore = true; };
          }
  
        }
      }
    }, [user]);
  
    // Дополнительный useEffect для обработки случая, когда пользователь еще не загружен
    useEffect(() => {
      const activeTab = localStorage.getItem('activeProfileTab');
      const skipReload = localStorage.getItem('skipReload');
      
      // Если есть активная вкладка, но пользователь еще не загружен, ждем загрузки
      if (activeTab && !user && skipReload) {
        return;
      }
    }, [user]);
  
    // useEffect для обработки изменений selectedSection в реальном времени
    useEffect(() => {
      const selectedSectionFromMenu = localStorage.getItem('selectedProfileSection');
      if (selectedSectionFromMenu && ['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(selectedSectionFromMenu)) {
        setSelectedSection(selectedSectionFromMenu);
        localStorage.removeItem('selectedProfileSection');
      }
    }, [selectedSection]);
  
    // Обработчик события изменения секции профиля
    useEffect(() => {
      const handleProfileSectionChange = (event) => {
        const section = event.detail;
        if (['myprofile', 'profile', 'orders', 'reviews', 'notifications', 'wishlist', 'viewed', 'auth'].includes(section)) {
          setSelectedSection(section);
        }
      };
  
      window.addEventListener('profileSectionChanged', handleProfileSectionChange);
      return () => {
        window.removeEventListener('profileSectionChanged', handleProfileSectionChange);
      };
    }, []);
    
    useEffect(() => {
      if (!user || !user.token) {
        setNotifications([]);
        setLoadingNotifications(false);
        setErrorNotifications('');
        return;
      }
      
      // Проверяем, не является ли это обновлением с перезагрузкой
      const skipReload = localStorage.getItem('skipReload');
      if (skipReload) {
        // Если это перезагрузка для переключения на уведомления, загружаем данные
        let ignore = false;
        setLoadingNotifications(true);
        setErrorNotifications('');
        fetch(`${API_BASE_URL}/api/profile/notifications`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
          .then(res => {
            if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
            return res.json();
          })
          .then(data => {
            if (!ignore) setNotifications(Array.isArray(data) ? data : []);
          })
          .catch(e => { if (!ignore) setErrorNotifications(e.message); })
          .finally(() => { if (!ignore) setLoadingNotifications(false); });
        return () => { ignore = true; };
      }
      
  
      
      let ignore = false;
      setLoadingNotifications(true);
      setErrorNotifications('');
      fetch(`${API_BASE_URL}/api/profile/notifications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
          return res.json();
        })
        .then(data => {
          if (!ignore) setNotifications(Array.isArray(data) ? data : []);
        })
        .catch(e => { if (!ignore) setErrorNotifications(e.message); })
        .finally(() => { if (!ignore) setLoadingNotifications(false); });
      return () => { ignore = true; };
    }, [user]);
    
    // Загружаем данные профиля при открытии страницы
    useEffect(() => {
      if ((selectedSection === 'profile' || selectedSection === 'myprofile') && user) {
        loadProfileData();
      }
    }, [selectedSection, user]);
  
    // Загружаем заказы при переключении на вкладку заказов
    useEffect(() => {
      if (selectedSection === 'orders' && user) {
        loadOrders();
      }
    }, [selectedSection, user]);
  
    // Загружаем отзывы при переключении на вкладку отзывов
    useEffect(() => {
      if (selectedSection === 'reviews' && user) {
        loadUserReviews();
      }
    }, [selectedSection, user]);
  
    // Загружаем уведомления при переключении на вкладку уведомлений
    useEffect(() => {
      if (selectedSection === 'notifications' && user) {
        // Очищаем флаг skipReload при явном переключении на уведомления
        localStorage.removeItem('skipReload');
        
        // Проверяем, нужно ли обнулить счетчик уведомлений
        const clearNotificationsFlag = localStorage.getItem('clearNotificationsOnProfile');
        if (clearNotificationsFlag === 'true') {
          // Обнуляем счетчик уведомлений в Navigation
          const event = new CustomEvent('clearNotificationsCount');
          window.dispatchEvent(event);
          localStorage.removeItem('clearNotificationsOnProfile');
        }
        
        let ignore = false;
        setLoadingNotifications(true);
        setErrorNotifications('');
        fetch(`${API_BASE_URL}/api/profile/notifications`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        })
          .then(res => {
            if (!res.ok) throw new Error('Ошибка загрузки уведомлений');
            return res.json();
          })
          .then(data => {
            if (!ignore) setNotifications(Array.isArray(data) ? data : []);
          })
          .catch(e => { if (!ignore) setErrorNotifications(e.message); })
          .finally(() => { if (!ignore) setLoadingNotifications(false); });
        return () => { ignore = true; };
      }
    }, [selectedSection, user]);
  
    // Загружаем информацию о отправленных отзывах и выполненных уведомлениях
    useEffect(() => {
      if (selectedSection === 'notifications' && user) {
        // Загружаем информацию о отправленных отзывах из localStorage
        const submittedReviewsData = localStorage.getItem('submittedReviews');
        if (submittedReviewsData) {
          try {
            const reviews = JSON.parse(submittedReviewsData);
            setSubmittedReviews(new Set(reviews));
          } catch (error) {
            console.error('Error parsing submitted reviews:', error);
          }
        }
        
        // Загружаем информацию о выполненных уведомлениях из localStorage
        const completedNotificationsData = localStorage.getItem('completedNotifications');
        if (completedNotificationsData) {
          try {
            const completed = JSON.parse(completedNotificationsData);
            setCompletedNotifications(new Set(completed));
          } catch (error) {
            console.error('Error parsing completed notifications:', error);
          }
        }
      }
    }, [selectedSection, user]);
  
  
  
    const loadProfileData = async () => {
      try {
        setProfileLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfileData(data.user);
          setProfileForm({
            name: data.user.name || '',
            surname: data.user.surname || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
          });
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      } finally {
        setProfileLoading(false);
      }
    };
  
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/profile/orders`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки заказов:', error);
      } finally {
        setOrdersLoading(false);
      }
    };
  
    const handleHideOrder = async (orderId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Скрываем заказ из списка
          setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
          alert('Заказ скрыт из списка');
        } else {
          const errorData = await response.json();
          alert(errorData.error || 'Ошибка скрытия заказа');
        }
      } catch (error) {
        console.error('Ошибка скрытия заказа:', error);
        alert('Ошибка скрытия заказа');
      }
    };
  
    const loadUserReviews = async () => {
      if (!user) return;
      
      try {
        setReviewsLoading(true);
        // Загружаем отзывы о товарах
        const productReviewsRes = await fetch(`${API_BASE_URL}/api/profile/reviews/product`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const productReviews = await productReviewsRes.json();
        
  
        
        // Загружаем отзывы о магазине
        const shopReviewsRes = await fetch(`${API_BASE_URL}/api/profile/reviews/shop`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const shopReviews = await shopReviewsRes.json();
        
  
        
        // Объединяем отзывы
        const allReviews = [
          ...productReviews.map(review => ({
            ...review,
            type: 'review',
            productName: review.product?.name || 'Товар',
            productImage: review.product?.imageUrls?.[0] ? 
              getImageUrl(review.product.imageUrls[0]) : 
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4xODM0IDI1IDM4IDMxLjgxNjYgMzggMzlDMzggNDYuMTgzNCAzMi4xODM0IDUzIDI1IDUzQzE3LjgxNjYgNTMgMTIgNDYuMTgzNCAxMiAzOUMxMiAzMS44MTY2IDE3LjgxNjYgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAzMUMyNy43NjE0IDMxIDMwIDMzLjIzODYgMzAgMzZDMzAgMzguNzYxNCAyNy43NjE0IDQxIDI1IDQxQzIyLjIzODYgNDEgMjAgMzguNzYxNCAyMCAzNkMyMCAzMy4yMzg2IDIyLjIzODYgMzEgMjUgMzFaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo='
          })),
          ...shopReviews.map(review => ({
            ...review,
            type: 'shop_review',
            productName: 'Магазин',
            productImage: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjBGMEYwIi8+CjxwYXRoIGQ9Ik0yNSAyNUMzMi4xODM0IDI1IDM4IDMxLjgxNjYgMzggMzlDMzggNDYuMTgzNCAzMi4xODM0IDUzIDI1IDUzQzE3LjgxNjYgNTMgMTIgNDYuMTgzNCAxMiAzOUMxMiAzMS44MTY2IDE3LjgxNjYgMjUgMjUgMjVaIiBmaWxsPSIjQ0NDIi8+CjxwYXRoIGQ9Ik0yNSAzMUMyNy43NjE0IDMxIDMwIDMzLjIzODYgMzAgMzZDMzAgMzguNzYxNCAyNy43NjE0IDQxIDI1IDQxQzIyLjIzODYgNDEgMjAgMzguNzYxNCAyMCAzNkMyMCAzMy4yMzg2IDIyLjIzODYgMzEgMjUgMzFaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo='
          }))
        ];
        
  
        
        setUserReviews(allReviews);
      } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
      } finally {
        setReviewsLoading(false);
      }
    };
  
    // Функция для скрытия отзыва о товаре
    const handleHideProductReview = async (reviewId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/reviews/product/${reviewId}/hide`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          // Перезагружаем отзывы
          loadUserReviews();
        } else {
          console.error('Ошибка скрытия отзыва о товаре');
        }
      } catch (error) {
        console.error('Ошибка скрытия отзыва о товаре:', error);
      }
    };
  
    // Функция для скрытия отзыва о магазине
    const handleHideShopReview = async (reviewId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/reviews/shop/${reviewId}/hide`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (response.ok) {
          // Перезагружаем отзывы
          loadUserReviews();
        } else {
          console.error('Ошибка скрытия отзыва о магазине');
        }
      } catch (error) {
        console.error('Ошибка скрытия отзыва о магазине:', error);
      }
    };
  
    const handleProfileInput = (e) => {
      setProfileForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };
    
    // Функции для работы с паролем
    const handlePasswordInput = (e) => {
      setPasswordForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };
    
    const handlePasswordSave = async (e) => {
      e.preventDefault();
      
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert('Новые пароли не совпадают');
        return;
      }
      
      if (passwordForm.newPassword.length < 6) {
        alert('Новый пароль должен содержать минимум 6 символов');
        return;
      }
      
      // Проверяем, есть ли у пользователя пароль
      const hasPassword = profileData?.hasPassword;
      
      // Для пользователей с паролем проверяем текущий пароль
      if (hasPassword && !passwordForm.currentPassword) {
        alert('Введите текущий пароль');
        return;
      }
      
      try {
        setPasswordLoading(true);
        const requestBody = {
          newPassword: passwordForm.newPassword
        };
        
        // Добавляем текущий пароль только если он есть
        if (hasPassword && passwordForm.currentPassword) {
          requestBody.currentPassword = passwordForm.currentPassword;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
          setPasswordSaved(true);
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setTimeout(() => setPasswordSaved(false), 3000);
        } else {
          const errorData = await response.json();
          alert('Ошибка смены пароля: ' + (errorData.error || 'Неизвестная ошибка'));
        }
      } catch (error) {
        console.error('Ошибка смены пароля:', error);
        alert('Ошибка смены пароля');
      } finally {
        setPasswordLoading(false);
      }
    };
    
    const togglePasswordVisibility = (field) => {
      setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };
    
    const handleProfileSave = async (e) => {
      e.preventDefault();
      try {
        setProfileLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: profileForm.name,
            surname: profileForm.surname,
            email: profileForm.email,
            phone: profileForm.phone
          })
        });
        
        if (response.ok) {
          setProfileSaved(true);
          // Получаем обновленные данные пользователя
          const responseData = await response.json();
          // Обновляем данные пользователя в localStorage
                  const updatedUser = {
            ...user, 
            name: responseData.user.name,
            surname: responseData.user.surname,
            phone: responseData.user.phone,
            googleId: responseData.user.googleId,
            facebookId: responseData.user.facebookId
          };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Обновляем profileData с новыми данными
          setProfileData(responseData.user);
          // Обновляем состояние пользователя в родительском компоненте
          if (handleUserUpdate) {
            handleUserUpdate(updatedUser);
          }
        } else {
          const errorData = await response.json();
          alert('Ошибка сохранения: ' + (errorData.error || 'Неизвестная ошибка'));
        }
      } catch (error) {
        console.error('Ошибка сохранения профиля:', error);
        alert('Ошибка сохранения профиля');
      } finally {
        setProfileLoading(false);
      }
    };
  
    useEffect(() => {
      setLocalWishlist(wishlist || []);
    }, [wishlist]);
  
    useEffect(() => {
      const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
      setLocalViewed(viewed);
      // Подписка на изменения localStorage (если вкладка другая очистила)
      const onStorage = (e) => {
        if (e.key === 'viewedProducts') {
          setLocalViewed(JSON.parse(e.newValue || '[]'));
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }, []);
  
    const handleClearWishlist = async () => {
      if (!user || !user.token) return;
      try {
        await fetch(`${API_BASE_URL}/api/profile/wishlist/clear`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        });
        setLocalWishlist([]);
      } catch (e) {
        alert('Ошибка при очистке списка желаний');
      }
    };
    const handleClearConfirm = () => {
      setClearDialogOpen(false);
      handleClearWishlist();
    };
    const handleClearCancel = () => {
      setClearDialogOpen(false);
    };
    const handleLogoutConfirm = () => {
      setLogoutDialogOpen(false);
      handleLogout();
    };
    const handleLogoutCancel = () => {
      setLogoutDialogOpen(false);
    };
  
    const handleClearViewed = () => {
      setLocalViewed([]);
      localStorage.setItem('viewedProducts', '[]');
    };
    const handleClearViewedConfirm = () => {
      setClearViewedDialogOpen(false);
      handleClearViewed();
    };
    const handleClearViewedCancel = () => {
      setClearViewedDialogOpen(false);
    };
    // Удалить один товар из просмотренных
    const handleRemoveViewed = (productId) => {
      const updated = localViewed.filter(p => p.id !== productId);
      setLocalViewed(updated);
      localStorage.setItem('viewedProducts', JSON.stringify(updated));
    };
  
    // Обработка удаления профиля
    const handleDeleteProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Удаляем данные пользователя из localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('cart');
          localStorage.removeItem('wishlist');
          localStorage.removeItem('viewedProducts');
          localStorage.removeItem('submittedReviews');
          localStorage.removeItem('completedNotifications');
          localStorage.removeItem('notificationsCleared');
          localStorage.removeItem('notificationsClearedAt');
          localStorage.removeItem('notificationsCountAtClear');
          localStorage.removeItem('clearNotificationsOnProfile');
          
          // Сбрасываем флаг уведомлений (будет обработано в Navigation)
          
          // Вызываем logout в родительском компоненте
          if (handleLogout) {
            handleLogout();
          }
        } else {
          const errorData = await response.json();
          alert('Ошибка удаления профиля: ' + (errorData.error || 'Неизвестная ошибка'));
        }
      } catch (error) {
        console.error('Ошибка удаления профиля:', error);
        alert('Ошибка удаления профиля');
      } finally {
        setDeleteProfileDialogOpen(false);
      }
    };
  
    const handleDeleteProfileConfirm = () => {
      handleDeleteProfile();
    };
  
    const handleDeleteProfileCancel = () => {
      setDeleteProfileDialogOpen(false);
    };
  
    // Создание красивого заголовка
    const createHeader = (title) => (
      <Typography variant="h5" sx={{ 
        fontWeight: 800, 
        mb: 3, 
        color: '#ff6600',
        fontFamily: '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
                        fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem', lg: '2.5rem', xl: '2.8rem' },
        textShadow: '0 2px 4px rgba(255, 102, 0, 0.2)',
        letterSpacing: '0.5px',
        background: 'linear-gradient(135deg, #ff6600 0%, #ff8533 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        {title}
      </Typography>
    );
    // Заглушки для разделов
    const renderSection = () => {
      switch (selectedSection) {
        case 'myprofile':
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 2, lg: 2 },
                maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                minHeight: 320,
                margin: 0,
                mt: 0,
                position: 'relative',
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {/* Заголовок и кнопки в одной строке */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 2,
                  width: '100%'
                }}>
                  {createHeader(t('profile.header.myProfile'))}
                  
                  <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setSelectedSection('profile')}
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: 15,
                        px: { xs: 2, md: 3 },
                        py: 1.5,
                        height: 44,
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                        textTransform: 'none',
                        minWidth: { xs: 'auto', md: 120 },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                      }}
                    >
                      {t('profile.buttons.edit')}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DeleteForeverIcon />}
                      onClick={() => setDeleteProfileDialogOpen(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: 15,
                        px: 3,
                        py: 1.5,
                        height: 44,
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                        textTransform: 'none',
                        minWidth: 120,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                      }}
                    >
                      {t('profile.buttons.deleteProfile')}
                    </Button>
                  </Box>
                </Box>
  
                {/* Основная информация */}
                <Box sx={{ 
                  display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr' },
                  gap: { xs: 4, md: 6 },
                  width: '100%',
                  maxWidth: { xs: '100%', md: 1000 }
                }}>
                  {/* Левая колонка - личная информация */}
                  <Box sx={{ 
                    width: '100%',
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#333', 
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                    }}>
                      <PersonIcon sx={{ color: '#4caf50', fontSize: { xs: 20, sm: 22, md: 24 } }} />
                      {t('profile.sections.personalInfo')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {/* Имя */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <PersonIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('profile.fields.firstName')}
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 500, mt: 0.5 }}>
                            {profileData?.name || user?.name || t('profile.value.notSpecified')}
                          </Typography>
                        </Box>
                      </Box>
  
                      {/* Фамилия */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <PersonIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('profile.fields.lastName')}
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 500, mt: 0.5 }}>
                            {profileData?.surname || user?.surname || t('profile.value.notSpecifiedF')}
                          </Typography>
                        </Box>
                      </Box>
  
                      {/* Email */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <EmailIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Email
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 500, mt: 0.5 }}>
                            {profileData?.email || user?.email}
                          </Typography>
                        </Box>
                      </Box>
  
                      {/* Телефон */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <PhoneIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('profile.fields.phone')}
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 500, mt: 0.5 }}>
                            {profileData?.phone || user?.phone || t('profile.value.notSpecified')}
                          </Typography>
                        </Box>
                      </Box>
  
                      {/* Дата регистрации */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          transform: 'translateY(-1px)'
                        }
                      }}>
                        <CalendarTodayIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('profile.fields.registeredAt')}
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 14, sm: 15, md: 16 }, fontWeight: 500, mt: 0.5 }}>
                            {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('ru-RU') : user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : t('profile.value.notSpecifiedF')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
  
                  {/* Правая колонка - статистика */}
                  <Box sx={{ 
                    width: '100%',
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    backgroundColor: '#fafafa',
                    border: '1px solid #e0e0e0'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 600, 
                      color: '#333', 
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                    }}>
                      <BarChartIcon sx={{ color: '#4caf50', fontSize: { xs: 20, sm: 22, md: 24 } }} />
                      {t('profile.sections.stats')}
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, 
                      gap: 3 
                    }}>
                      {/* Товары в корзине */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                          transform: 'translateY(-2px)',
                          borderColor: '#4caf50'
                        }
                      }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          backgroundColor: '#e8f5e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <ShoppingCartIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('profile.stats.cartItems')}
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 20, sm: 22, md: 24 }, fontWeight: 700, mt: 0.5 }}>
                            {cart?.length || 0}
                          </Typography>
                        </Box>
                      </Box>
  
                      {/* Избранные товары */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                          transform: 'translateY(-2px)',
                          borderColor: '#4caf50'
                        }
                      }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          backgroundColor: '#e8f5e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FavoriteIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('profile.stats.wishlistItems')}
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 20, sm: 22, md: 24 }, fontWeight: 700, mt: 0.5 }}>
                            {localWishlist?.length || 0}
                          </Typography>
                        </Box>
                      </Box>
  
                      {/* Просмотренные товары */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 3,
                        borderRadius: 3,
                        backgroundColor: '#fff',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.15)',
                          transform: 'translateY(-2px)',
                          borderColor: '#4caf50'
                        }
                      }}>
                        <Box sx={{ 
                          p: 1.5, 
                          borderRadius: 2, 
                          backgroundColor: '#e8f5e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <VisibilityIcon sx={{ color: '#4caf50', fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography sx={{ color: '#666', fontSize: { xs: 11, sm: 12 }, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {t('profile.stats.viewedItems')}
                          </Typography>
                          <Typography sx={{ color: '#333', fontSize: { xs: 20, sm: 22, md: 24 }, fontWeight: 700, mt: 0.5 }}>
                            {localViewed?.length || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        case 'notifications': {
          const getNotificationIcon = (type) => {
            switch (type) {
              case 'order': return <ShoppingCartIcon sx={{ color: '#4caf50', fontSize: { xs: 24, md: 28 } }} />;
              case 'promo': return <FavoriteIcon sx={{ color: '#ff9800', fontSize: { xs: 24, md: 28 } }} />;
              case 'system': return <NotificationsIcon sx={{ color: '#2196f3', fontSize: { xs: 24, md: 28 } }} />;
              default: return <NotificationsIcon sx={{ color: '#666', fontSize: { xs: 24, md: 28 } }} />;
            }
          };
          // --- Новое: функции удаления ---
          const handleDeleteNotification = async (id) => {
            if (!user || !user.token) return;
            if (!window.confirm('Удалить это уведомление?')) return;
            try {
              await fetch(`${API_BASE_URL}/api/profile/notifications/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
              });
              // Обновить список
              setNotifications(notifications => notifications.filter(n => n.id !== id));
            } catch (e) {
              alert('Ошибка удаления уведомления');
            }
          };
          const handleDeleteAllNotifications = async () => {
            if (!user || !user.token) return;
            try {
              await fetch(`${API_BASE_URL}/api/profile/notifications`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
              });
              setNotifications([]);
            } catch (e) {
              alert('Ошибка удаления всех уведомлений');
            }
          };
  
          const handleNotificationAction = (notif) => {
            if (notif.type === 'review_request') {
              // НЕ отмечаем уведомление как выполненное для отзывов
              // Уведомление будет отмечено только после полного заполнения всех отзывов
              
              // Перенаправляем на страницу отзывов о заказе
              // Извлекаем orderId из actionUrl
              if (notif.actionUrl) {
                try {
                  const url = new URL(notif.actionUrl);
                  const orderId = url.searchParams.get('orderId');
                  if (orderId && orderId !== 'latest') {
                    window.location.href = `/review-order?orderId=${orderId}`;
                  } else {
                    // Fallback - перенаправляем на страницу отзывов без orderId
                    window.location.href = `/review-order`;
                  }
                } catch (error) {
                  console.error('Error parsing actionUrl:', error);
                  // Fallback - перенаправляем на страницу отзывов без orderId
                  window.location.href = `/review-order`;
                }
              } else {
                // Fallback - перенаправляем на страницу отзывов без orderId
                window.location.href = `/review-order`;
              }
            } else {
              // Для других типов уведомлений отмечаем как выполненное
              setCompletedNotifications(prev => new Set([...prev, notif.id]));
              
              // Сохраняем в localStorage
              const completedNotificationsData = localStorage.getItem('completedNotifications');
              let completedNotifications = completedNotificationsData ? JSON.parse(completedNotificationsData) : [];
              if (!completedNotifications.includes(notif.id)) {
                completedNotifications.push(notif.id);
                localStorage.setItem('completedNotifications', JSON.stringify(completedNotifications));
              }
              
              if (notif.actionUrl) {
                // Переходим на страницу действия
                window.location.href = notif.actionUrl;
              }
            }
          };
  
          // Функция для проверки, был ли отправлен отзыв для заказа
          const isReviewSubmitted = (notif) => {
            if (notif.type !== 'review_request') return false;
            
            try {
              if (notif.actionUrl) {
                const url = new URL(notif.actionUrl);
                const orderId = url.searchParams.get('orderId');
                if (!orderId) return false;
                
                // Проверяем, есть ли полная информация о заполненных отзывах
                const reviewProgress = localStorage.getItem(`reviewProgress_${orderId}`);
                if (reviewProgress) {
                  const progress = JSON.parse(reviewProgress);
                  // Возвращаем true только если все отзывы заполнены
                  return progress.shopReview && progress.productReviews && 
                         progress.productReviews.length === progress.totalProducts;
                }
                
                // Fallback - проверяем старую логику
                return submittedReviews.has(orderId);
              }
            } catch (error) {
              console.error('Error parsing actionUrl:', error);
            }
            return false;
          };
  
          // Функция для получения прогресса заполнения отзывов
          const getReviewProgress = (notif) => {
            if (notif.type !== 'review_request') return null;
            
            try {
              if (notif.actionUrl) {
                const url = new URL(notif.actionUrl);
                const orderId = url.searchParams.get('orderId');
                if (!orderId) return null;
                
                const reviewProgress = localStorage.getItem(`reviewProgress_${orderId}`);
                if (reviewProgress) {
                  return JSON.parse(reviewProgress);
                }
              }
            } catch (error) {
              console.error('Error getting review progress:', error);
            }
            return null;
          };
  
          // Функция для получения текста уведомления в зависимости от прогресса
          const getNotificationText = (notif) => {
            if (notif.type !== 'review_request') {
              // Для других типов уведомлений переводим сообщение, если оно начинается с 'reviews.'
              const message = notif.message || notif.text;
              return message.startsWith('reviews.') ? t(message) : message;
            }
            
            const progress = getReviewProgress(notif);
            if (!progress) {
              // Если нет прогресса, переводим сообщение из backend
              const message = notif.message || notif.text;
              return message.startsWith('reviews.') ? t(message) : message;
            }
            
            const { shopReview, productReviews, totalProducts } = progress;
            const completedProducts = productReviews ? productReviews.length : 0;
            
            if (!shopReview && completedProducts === 0) {
              return t('reviews.modal.title');
            } else if (!shopReview) {
              return t('reviews.progress.shopReviewPending', { completedProducts, totalProducts });
            } else if (completedProducts < totalProducts) {
              return t('reviews.progress.productsRemaining', { remaining: totalProducts - completedProducts, totalProducts });
            } else {
              return t('reviews.progress.completed');
            }
          };
  
          // Функция для проверки, было ли уведомление выполнено
          const isNotificationCompleted = (notif) => {
            // Проверяем, было ли уведомление выполнено (например, переход по ссылке)
            return completedNotifications.has(notif.id);
          };
  
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 2, lg: 2 },
                maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                minHeight: 320,
                margin: 0,
                mt: 0,
                position: 'relative',
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4, 
                  borderBottom: '2px solid #f0f0f0', 
                  pb: 2,
                  width: '100%'
                }}>
                {createHeader(t('profile.header.notifications'))}
                  {notifications.length > 0 && (
                    <Button 
                      variant="contained" 
                      onClick={handleDeleteAllNotifications} 
                      startIcon={<Delete />} 
                      sx={{ 
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: 14, md: 15 },
                        px: { xs: 2, md: 3 },
                        py: 1.5,
                        height: 44,
                        boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                        textTransform: 'none',
                        minWidth: { xs: 'auto', md: 120 },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                          boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                      }}
                    >
                      {t('profile.notifications.deleteAll')}
                    </Button>
                  )}
                </Box>
                {loadingNotifications ? (
                  <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>Загрузка...</Typography>
                ) : errorNotifications ? (
                  <Typography sx={{ textAlign: 'center', color: '#d32f2f', fontSize: 18, mt: 6 }}>{errorNotifications}</Typography>
                ) : notifications.length === 0 ? (
                  <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>
                    {t('common.noNotifications')}
                  </Typography>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3,
                    width: '100%',
                    maxWidth: { xs: '100%', md: '100%', lg: '100%' }
                  }}>
                    {notifications.map((notif) => {
                      const isSubmitted = isReviewSubmitted(notif);
                      const isCompleted = isNotificationCompleted(notif);
                      const progress = getReviewProgress(notif);
                      const isReviewActive = notif.type === 'review_request' && progress && !isSubmitted;
                      
                      return (
                      <Box
                        key={notif.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: { xs: 2, md: 3 },
                          p: { xs: 2, md: 3 },
                          border: isSubmitted || isCompleted ? '1px solid #e0e0e0' : (notif.isRead ? '1px solid #e0e0e0' : '2px solid #ff0844'),
                          borderRadius: 3,
                          backgroundColor: isSubmitted || isCompleted ? '#f5f5f5' : (notif.isRead ? '#fafafa' : '#fff4f4'),
                          boxShadow: isSubmitted || isCompleted ? 'none' : (notif.isRead ? 'none' : '0 2px 8px rgba(255,8,68,0.08)'),
                          transition: 'all 0.2s',
                          position: 'relative',
                          opacity: isSubmitted || isCompleted ? 0.6 : 1,
                          width: '100%',
                          '&:hover': {
                            boxShadow: isSubmitted || isCompleted ? 'none' : '0 4px 16px rgba(255,8,68,0.12)',
                            backgroundColor: isSubmitted || isCompleted ? '#f5f5f5' : '#fff0f0',
                          }
                        }}
                      >
                        {getNotificationIcon(notif.type)}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ 
                            fontWeight: 600, 
                            color: isSubmitted || isCompleted ? '#999' : (notif.isRead ? '#888' : '#ff0844'), 
                            fontSize: { xs: 13, sm: 14, md: 16 },
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {notif.title.startsWith('reviews.') ? t(notif.title) : notif.title}
                          </Typography>
                          <Typography sx={{ 
                            color: '#333', 
                            fontSize: { xs: 12, sm: 13, md: 15 }, 
                            mt: 1, 
                            mb: 1,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: 1.4
                          }}>
                            {getNotificationText(notif)}
                          </Typography>
                          <Typography sx={{ 
                            color: '#999', 
                            fontSize: { xs: 10, sm: 11, md: 13 } 
                          }}>
                            {notif.createdAt ? new Date(notif.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </Typography>
                          {notif.actionUrl && notif.actionText && !isSubmitted && !isCompleted && (
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleNotificationAction(notif)}
                              sx={{ 
                                mt: 1, 
                                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                                color: '#fff',
                                borderRadius: 2,
                                fontWeight: 600,
                                fontSize: { xs: 14, md: 15 },
                                px: { xs: 2, md: 3 },
                                py: 1.5,
                                height: 44,
                                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                                textTransform: 'none',
                                minWidth: { xs: '100%', md: 120 },
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                                  transform: 'translateY(-1px)'
                                },
                              }}
                            >
                              {notif.actionText.startsWith('reviews.') ? t(notif.actionText) : notif.actionText}
                            </Button>
                          )}
                          {isSubmitted && (
                            <Typography sx={{ 
                              mt: 1, 
                              color: '#4caf50', 
                              fontSize: { xs: 11, md: 12 }, 
                              fontWeight: 600 
                            }}>
                              {t('profile.notifications.reviewSubmitted')}
                            </Typography>
                          )}
                          {isCompleted && !isSubmitted && (
                            <Typography sx={{ 
                              mt: 1, 
                              color: '#2196f3', 
                              fontSize: { xs: 11, md: 12 }, 
                              fontWeight: 600 
                            }}>
                              {t('profile.notifications.completed')}
                            </Typography>
                          )}
                        </Box>
                        <IconButton 
                          onClick={() => handleDeleteNotification(notif.id)} 
                          size="small" 
                          sx={{ 
                            ml: { xs: 0.5, md: 1 }, 
                            color: '#ff1744',
                            minWidth: 'auto'
                          }} 
                          title={t('profile.notifications.deleteNotification')}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                        {!isSubmitted && !isCompleted && !notif.isRead && (
                          <Box sx={{ 
                            width: { xs: 8, md: 12 }, 
                            height: { xs: 8, md: 12 }, 
                            borderRadius: '50%', 
                            background: '#ff0844', 
                            mt: 0.5 
                          }} />
                        )}
                      </Box>
                    );
                  })}
                  </Box>
                )}
              </Box>
            </Box>
          );
        }
        case 'orders':
          // Функции для работы с заказами
         
  
  
  
          const formatPrice = (price) => {
            return `₪${price}`;
          };
  
          const getStatusColor = (status) => {
            switch (status) {
              case 'pending': return '#ff6b35';
              case 'confirmed': return '#2196f3';
              case 'ready': return '#9c27b0';
              case 'pickedup': return '#4caf50';
              case 'cancelled': return '#f44336';
              default: return '#666';
            }
          };
  
          const getStatusGradient = (status) => {
            switch (status) {
              case 'pending': return 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)';
              case 'confirmed': return 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)';
              case 'ready': return 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)';
              case 'pickedup': return 'linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)';
              case 'cancelled': return 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)';
              default: return 'linear-gradient(135deg, #666 0%, #999 100%)';
            }
          };
  
          const getStatusIcon = (status) => {
            switch (status) {
              case 'pending': return '⏳';
              case 'confirmed': return '✓';
              case 'ready': return '📦';
              case 'pickedup': return '✓';
              case 'cancelled': return '❌';
              default: return '•';
            }
          };
  
          const getStatusText = (status) => {
            switch (status) {
              case 'pending': return t('profile.orders.status.pending');
              case 'confirmed': return t('profile.orders.status.confirmed');
              case 'ready': return t('profile.orders.status.ready');
              case 'pickedup': return t('profile.orders.status.pickedup');
              case 'cancelled': return t('profile.orders.status.cancelled');
              default: return status;
            }
          };
  
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 2, lg: 2 },
                maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                minHeight: 320,
                margin: 0,
                mt: 0,
                position: 'relative',
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {/* Заголовок с серой линией */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 2,
                  width: '100%'
                }}>
                {createHeader(t('profile.header.orders'))}
                </Box>
                
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress />
                  </Box>
                ) : orders.length === 0 ? (
                  <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>
                    {t('profile.orders.empty')}
                  </Typography>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3,
                    width: '100%',
                    maxWidth: { xs: '100%', md: '100%', lg: '100%' }
                  }}>
                    {orders.map((order) => (
                      <Box
                        key={order.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 4,
                          p: { xs: 2, md: 4 },
                          backgroundColor: '#fff',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          overflow: 'hidden',
                          width: '100%',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '4px',
                            height: '100%',
                            background: getStatusGradient(order.status),
                            borderRadius: '0 2px 2px 0'
                          },
                          '&:hover': {
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                            transform: 'translateY(-4px)',
                            borderColor: getStatusColor(order.status) + '40'
                          }
                        }}
                      >
                        {/* Заголовок заказа */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                          alignItems: { xs: 'flex-start', md: 'center' },
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: { xs: 2, md: 0 },
                          mb: 2,
                          pb: 2,
                          borderBottom: '1px solid #e0e0e0'
                        }}>
                          <Box>
                            <Typography sx={{ 
                              fontWeight: 600, 
                              color: '#333', 
                              fontSize: { xs: 13, sm: 14, md: 16 } 
                            }}>
                              {t('profile.orders.orderN', { id: order.id })}
                            </Typography>
                            <Typography sx={{ 
                              color: '#666', 
                              fontSize: { xs: 11, sm: 12, md: 14 } 
                            }}>
                              {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 0.5, md: 1 },
                            flexDirection: { xs: 'row', md: 'row' }
                          }}>
                            <Box sx={{ 
                              display: 'inline-block', 
                              px: { xs: 1.5, md: 2 }, 
                              py: 0.5, 
                              borderRadius: 1, 
                              backgroundColor: getStatusColor(order.status) + '20',
                              color: getStatusColor(order.status),
                              fontSize: { xs: '0.75rem', md: '0.875rem' },
                              fontWeight: 'medium'
                            }}>
                              {getStatusText(order.status)}
                            </Box>
                            {(order.status === 'pickedup' || order.status === 'cancelled') && (
                              <IconButton 
                                onClick={() => handleHideOrder(order.id)} 
                                size="small" 
                                sx={{ 
                                  ml: { xs: 0.5, md: 1 },
                                  color: '#ff1744',
                                  '&:hover': {
                                    backgroundColor: 'rgba(255, 23, 68, 0.1)',
                                    color: '#d50000'
                                  }
                                }} 
                                title={t('profile.orders.removeFromList')}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
  
                        {/* Товары в заказе */}
                        <Box sx={{ mb: 2 }}>
                          {order.items?.map((item, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 2, md: 3 },
                                p: { xs: 2, md: 3 },
                                mb: 2,
                                backgroundColor: '#fafafa',
                                borderRadius: 3,
                                border: '1px solid #e8e8e8',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  backgroundColor: '#f5f5f5',
                                  transform: 'translateX(4px)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }
                              }}
                            >
                              <Box
                                sx={{
                                  width: { xs: 50, md: 70 },
                                  height: { xs: 50, md: 70 },
                                  borderRadius: 3,
                                  background: item.product?.imageUrls && item.product.imageUrls.length > 0
                                    ? `center/cover no-repeat url(${getImageUrl(item.product.imageUrls[0])})` 
                                    : '#f0f0f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  border: '2px solid #fff',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                  }
                                }}
                              >
                                {(!item.product?.imageUrls || item.product.imageUrls.length === 0) && (
                                  <img 
                                    src="/photography.jpg" 
                                    alt="Фото товара"
                                    style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover', 
                                      borderRadius: '8px',
                                      opacity: 0.5
                                    }} 
                                  />
                                )}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography sx={{ 
                                  fontWeight: 500, 
                                  color: '#333', 
                                  fontSize: { xs: 12, md: 14 } 
                                }}>
                                  {item.product ? getTranslatedName(item.product) : t('common.productNotFound')}
                                </Typography>
                                <Typography sx={{ 
                                  color: '#666', 
                                  fontSize: { xs: 10, md: 12 } 
                                }}>
                                  {t('common.quantity')}: {item.quantity}
                                </Typography>
                              </Box>
                              <Typography sx={{ 
                                fontWeight: 600, 
                                color: '#333', 
                                fontSize: { xs: 14, md: 16 } 
                              }}>
                                {formatPrice(item.price * item.quantity)}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
  
                        {/* Итого */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          pt: 2,
                          borderTop: '1px solid #e0e0e0'
                        }}>
                          <Typography sx={{ 
                            fontWeight: 600, 
                            color: '#333', 
                            fontSize: { xs: 14, md: 16 } 
                          }}>
                            {t('profile.orders.total')}
                          </Typography>
                          <Typography sx={{ 
                            fontWeight: 700, 
                            color: '#ff0844', 
                            fontSize: { xs: 16, md: 18 } 
                          }}>
                            {formatPrice(order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0)}
                          </Typography>
                        </Box>
  
  
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          );
        case 'reviews':
          // Используем отзывы, загруженные на уровне компонента
  
          const getReviewTypeIcon = (type) => {
            return type === 'review' ? '⭐' : '❓';
          };
  
          const getReviewTypeColor = (type) => {
            return type === 'review' ? '#ff9800' : '#2196f3';
          };
  
  
  
          const renderStars = (rating) => {
            return '★'.repeat(rating) + '☆'.repeat(5 - rating);
          };
  
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 2, lg: 2 },
                maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                minHeight: 320,
                margin: 0,
                mt: 0,
                position: 'relative',
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {/* Заголовок с серой линией */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 2,
                  width: '100%'
                }}>
                {createHeader(t('profile.header.reviews'))}
                </Box>
                
                {reviewsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : userReviews.length === 0 ? (
                  <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>
                    {t('common.noReviews')}
                  </Typography>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 3,
                    width: '100%',
                    maxWidth: { xs: '100%', md: '100%', lg: '100%' }
                  }}>
                    {userReviews.map((review) => (
                      <Box
                        key={review.id}
                        sx={{
                          border: '1px solid #e0e0e0',
                          borderRadius: 3,
                          p: { xs: 2, md: 3 },
                          backgroundColor: '#fafafa',
                          transition: 'all 0.2s ease',
                          width: '100%',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        {/* Заголовок */}
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                          alignItems: { xs: 'flex-start', md: 'flex-start' },
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: { xs: 2, md: 0 },
                          mb: 2,
                          pb: 2,
                          borderBottom: '1px solid #e0e0e0'
                        }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 1.5, md: 2 },
                            flexDirection: { xs: 'row', md: 'row' }
                          }}>
                            <Box
                              sx={{
                                width: { xs: 40, md: 50 },
                                height: { xs: 40, md: 50 },
                                borderRadius: 2,
                                backgroundColor: '#f0f0f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              <img
                                src={review.productImage && review.productImage.startsWith('/') ? review.productImage : (review.productImage ? getImageUrl(review.productImage) : '/photography.jpg')}
                                alt="Фото товара"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '8px'
                              }}
                              onError={(e) => {
                                  e.target.src = '/photography.jpg';
                              }}
                            />
                            </Box>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography sx={{ 
                                  fontWeight: 600, 
                                  color: '#333', 
                                fontSize: { xs: 13, sm: 14, md: 16 },
                                mb: 1,
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                                }}>
                                  {review.productName}
                                </Typography>
                              <Typography sx={{ 
                                color: '#666', 
                                fontSize: { xs: 11, sm: 12, md: 14 } 
                              }}>
                                {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                              </Typography>
                            </Box>
                          </Box>
                          
                          {/* Кнопка удаления */}
                          <IconButton 
                            onClick={() => {
                              if (review.type === 'review') {
                                handleHideProductReview(review.id);
                              } else {
                                handleHideShopReview(review.id);
                              }
                            }}
                            size="small" 
                            sx={{ 
                              ml: { xs: 0, md: 1 }, 
                              color: '#ff1744',
                              alignSelf: { xs: 'flex-end', md: 'flex-start' }
                            }} 
                            title="Удалить из профиля"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
  
                        {/* Содержание */}
                        <Box sx={{ mb: 2 }}>
                          {review.type === 'review' && review.rating && (
                            <Typography sx={{ 
                              color: '#ff9800', 
                              fontSize: { xs: 16, md: 18 }, 
                              mb: 1 
                            }}>
                              {renderStars(review.rating)}
                            </Typography>
                          )}
                          <Typography sx={{ 
                            color: '#666', 
                            fontSize: { xs: 12, sm: 13, md: 14 }, 
                            lineHeight: 1.6,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                          }}>
                            {review.comment || review.text || 'Комментарий отсутствует'}
                          </Typography>
                        </Box>
  
                        {/* Ответ (если есть) */}
                        {review.answer && (
                          <Box sx={{ 
                            mt: 2, 
                            p: { xs: 1.5, md: 2 }, 
                            backgroundColor: '#e3f2fd', 
                            borderRadius: 2,
                            border: '1px solid #2196f3'
                          }}>
                            <Typography sx={{ 
                              fontWeight: 600, 
                              color: '#1976d2', 
                              fontSize: { xs: 12, sm: 13, md: 14 }, 
                              mb: 1 
                            }}>
                              Ответ:
                            </Typography>
                            <Typography sx={{ 
                              color: '#333', 
                              fontSize: { xs: 12, sm: 13, md: 14 }, 
                              lineHeight: 1.6,
                              wordBreak: 'break-word',
                              overflowWrap: 'break-word'
                            }}>
                              {review.answer}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          );
        case 'wishlist':
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              {localWishlist && localWishlist.length === 0 ? (
                                            <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>{t('common.noWishlistItems')}</Typography>
              ) : (
                <Box sx={{
                  background: '#fff',
                  borderRadius: 4,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  p: { xs: 2, md: 2, lg: 2 },
                  maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                  minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                  minHeight: 320,
                  margin: 0,
                  mt: 0,
                  position: 'relative',
                  left: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  {/* Заголовок и кнопка в одной строке */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                    alignItems: { xs: 'flex-start', md: 'center' }, 
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 0 },
                    mb: 4,
                    borderBottom: '2px solid #f0f0f0',
                    pb: 2,
                    width: '100%'
                  }}>
                {createHeader(t('profile.header.wishlist'))}
                    
                    {localWishlist && localWishlist.length > 0 && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setClearDialogOpen(true)}
                        sx={{
                          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                          color: '#fff',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: { xs: 14, md: 15 },
                          px: { xs: 2, md: 3 },
                          py: 1.5,
                          height: 44,
                          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                          textTransform: 'none',
                          minWidth: { xs: '100%', md: 120 },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                        }}
                      >
                        {t('profile.wishlist.clearButton')}
                      </Button>
                    )}
                  </Box>
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' },
                    gap: 2,
                    justifyItems: 'center',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'start' },
                    maxWidth: '100%',
                    margin: 0,
                  }}>
                    {localWishlist.map(item => (
                      <ProductCard
                        key={item.product?.id || item.id}
                        product={item.product}
                        user={user}
                        inWishlist={true}
                        onWishlistToggle={handleWishlistToggle}
                        onAddToCart={handleAddToCart}
                        cart={cart}
                        onChangeCartQuantity={handleChangeCartQuantity}
                        onEditProduct={onEditProduct}
                        viewMode="grid"
                      />
                    ))}
                    {Array.from({ length: Math.max(0, (window.innerWidth >= 1400 ? 4 : 3) - localWishlist.length) }).map((_, idx) => (
                      <Box key={`empty-wishlist-${idx}`} />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          );
        case 'viewed':
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              {localViewed && localViewed.length === 0 ? (
                                            <Typography sx={{ textAlign: 'center', color: '#888', fontSize: 20, mt: 6 }}>{t('common.noViewedProducts')}</Typography>
              ) : (
                <Box sx={{
                  background: '#fff',
                  borderRadius: 4,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  p: { xs: 2, md: 2, lg: 2 },
                  maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                  minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                  minHeight: 320,
                  margin: 0,
                  mt: 0,
                  position: 'relative',
                  left: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                }}>
                  {/* Заголовок и кнопка в одной строке */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: { xs: 'flex-start', md: 'space-between' }, 
                    alignItems: { xs: 'flex-start', md: 'center' }, 
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 2, md: 0 },
                    mb: 4,
                    borderBottom: '2px solid #f0f0f0',
                    pb: 2,
                    width: '100%'
                  }}>
                {createHeader(t('profile.header.viewed'))}
                    
                    {localViewed && localViewed.length > 0 && (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setClearViewedDialogOpen(true)}
                        sx={{
                          background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                          color: '#fff',
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: { xs: 14, md: 15 },
                          px: { xs: 2, md: 3 },
                          py: 1.5,
                          height: 44,
                          boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                          textTransform: 'none',
                          minWidth: { xs: '100%', md: 120 },
                          '&:hover': {
                            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                            boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                            transform: 'translateY(-1px)'
                          },
                        }}
                      >
                        {t('profile.viewed.clearButton')}
                      </Button>
                    )}
                  </Box>
                  
                                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' },
                    gap: 2,
                    justifyItems: 'center',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', sm: 'start' },
                    maxWidth: '100%',
                    margin: 0,
                  }}>
                    {localViewed.map(product => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        user={user}
                        isViewed={true}
                        onRemoveViewed={() => handleRemoveViewed(product.id)}
                        onAddToCart={handleAddToCart}
                        cart={cart}
                        onChangeCartQuantity={handleChangeCartQuantity}
                        onEditProduct={onEditProduct}
                        viewMode="grid"
                      />
                    ))}
                  </Box>
                </Box>
              )}
  
            </Box>
          );
        case 'profile':
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 2, lg: 2 },
                maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                minHeight: 320,
                margin: 0,
                mt: 0,
                position: 'relative',
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {/* Заголовок с серой линией */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 2,
                  width: '100%'
                }}>
                {createHeader(t('profile.header.personalData'))}
                </Box>
                <Typography sx={{ color: '#888', fontSize: 16, mb: 3, textAlign: 'center' }}>
                  {profileLoading ? t('profile.personal.loading') : t('profile.personal.hint')}
                </Typography>
                <Box component="form" onSubmit={handleProfileSave} sx={{ width: '100%', maxWidth: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField 
                    label={t('profile.fields.firstName')} 
                    name="name" 
                    value={profileForm.name} 
                    onChange={handleProfileInput} 
                    variant="outlined" 
                    fullWidth 
                    disabled={profileLoading}
                  />
                  <TextField 
                    label={t('profile.fields.lastName')} 
                    name="surname" 
                    value={profileForm.surname} 
                    onChange={handleProfileInput} 
                    variant="outlined" 
                    fullWidth 
                    disabled={profileLoading}
                  />
                  <TextField 
                    label="Email" 
                    name="email" 
                    value={profileForm.email} 
                    onChange={handleProfileInput} 
                    variant="outlined" 
                    type="email" 
                    fullWidth 
                    disabled={profileLoading}
                  />
                  <TextField 
                    label={t('profile.fields.phone')} 
                    name="phone" 
                    value={profileForm.phone} 
                    onChange={handleProfileInput} 
                    variant="outlined" 
                    type="tel" 
                    fullWidth 
                    disabled={profileLoading}
                  />
  
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={profileLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                      color: '#fff',
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: 15,
                      px: { xs: 2, md: 3 },
                      py: 1.5,
                      height: 44,
                      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: 160 },
                      '&:hover': {
                        background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                        transform: 'translateY(-1px)'
                      },
                    }}
                  >
                    {profileLoading ? <CircularProgress size={24} color="inherit" /> : t('common.save')}
                  </Button>
                </Box>
              </Box>
            </Box>
          );
  
        case 'auth':
          return (
            <Box sx={{ mt: -10, minHeight: 400, py: 2, pt: 1, px: { xs: 0, md: 0 } }}>
              <Box sx={{
                background: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                p: { xs: 2, md: 2, lg: 2 },
                maxWidth: { xs: '100%', md: '100%', lg: '100%' },
                minWidth: { xs: 'auto', md: 'auto', lg: 'auto' },
                minHeight: 320,
                margin: 0,
                mt: 0,
                position: 'relative',
                left: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
              }}>
                {/* Заголовок с серой линией */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'flex-start', md: 'flex-start' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 2, md: 0 },
                  mb: 4,
                  borderBottom: '2px solid #f0f0f0',
                  pb: 2,
                  width: '100%'
                }}>
                {createHeader(t('profile.header.authSettings'))}
                </Box>
                
                {/* Смена пароля */}
                <Box sx={{ mb: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Lock sx={{ color: '#ff0844', fontSize: { xs: 24, sm: 26, md: 28, lg: 32, xl: 36 } }} />
                                       <Typography variant="h5" sx={{ fontWeight: 600, color: '#333', fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem', lg: '1.8rem', xl: '2rem' } }}>
                       {t('profile.auth.changePassword')}
                     </Typography>
                  </Box>
                  
                  <Box component="form" onSubmit={handlePasswordSave} sx={{ maxWidth: { xs: '100%', md: 500 } }}>
                    {/* Показываем поле "Текущий пароль" только для пользователей с паролем */}
                    {profileData?.hasPassword && (
                      <TextField
                        label={t('profile.auth.currentPassword')}
                        name="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInput}
                        variant="outlined"
                        fullWidth
                        required
                        disabled={passwordLoading}
                        sx={{ mb: 3 }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => togglePasswordVisibility('current')}
                                edge="end"
                              >
                                {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    
                    {/* Информация для OAuth пользователей */}
                    {!profileData?.hasPassword && (
                      <Box sx={{ 
                        mb: 3, 
                        p: 2, 
                        bgcolor: '#f0f8ff', 
                        borderRadius: 2, 
                        border: '1px solid #e3f2fd' 
                      }}>
                        <Typography sx={{ color: '#1976d2', fontSize: 14, fontWeight: 500 }}>
                          {t('profile.auth.oauthInfo', { provider: profileData?.googleId ? 'Google' : 'Facebook' })}
                        </Typography>
                      </Box>
                    )}
                    
                    <TextField
                      label={t('profile.auth.newPassword')}
                      name="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordInput}
                      variant="outlined"
                      fullWidth
                      required
                      disabled={passwordLoading}
                      sx={{ mb: 3 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('new')}
                              edge="end"
                            >
                              {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      label={t('profile.auth.confirmNewPassword')}
                      name="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordInput}
                      variant="outlined"
                      fullWidth
                      required
                      disabled={passwordLoading}
                      sx={{ mb: 4 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => togglePasswordVisibility('confirm')}
                              edge="end"
                            >
                              {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={passwordLoading}
                      sx={{
                        background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                        color: '#fff',
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: 14, md: 15 },
                        px: { xs: 2, md: 3 },
                        py: 1.5,
                        height: 44,
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                        textTransform: 'none',
                        minWidth: { xs: '100%', md: 120 },
                        '&:hover': {
                          background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                          transform: 'translateY(-1px)'
                        },
                      }}
                    >
                      {passwordLoading ? <CircularProgress size={24} color="inherit" /> : t('profile.auth.changePassword')}
                    </Button>
                  </Box>
                </Box>
                
                {/* Подключенные аккаунты */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AccountCircle sx={{ color: '#ff0844', fontSize: { xs: 24, sm: 26, md: 28, lg: 32, xl: 36 } }} />
                                       <Typography variant="h5" sx={{ fontWeight: 600, color: '#333', fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.5rem', lg: '1.8rem', xl: '2rem' } }}>
                       {t('profile.auth.connectedAccounts')}
                     </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Google */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'flex-start', md: 'space-between' },
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: { xs: 2, md: 0 },
                      p: { xs: 2, md: 3 },
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      background: '#fafafa'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Google sx={{ color: '#4285f4', fontSize: { xs: 20, sm: 22, md: 24, lg: 28, xl: 32 } }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#333' }}>
                            Google
                          </Typography>
                          <Typography sx={{ color: '#666', fontSize: 14 }}>
                            {profileData?.googleId ? t('profile.auth.connected') : t('profile.auth.notConnected')}
                          </Typography>
                        </Box>
                      </Box>
                                            <Button
                          variant="contained"
                          sx={{
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: '#fff',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: { xs: 14, md: 15 },
                            px: { xs: 2, md: 3 },
                            py: 1.5,
                            height: 44,
                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                            textTransform: 'none',
                            minWidth: { xs: '100%', md: 120 },
                            '&:hover': {
                              background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                          }}
                        >
                          {profileData?.googleId ? t('profile.auth.disconnect') : t('profile.auth.connect')}
                        </Button>
                    </Box>
                    
                    {/* Facebook */}
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: { xs: 'flex-start', md: 'space-between' },
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: { xs: 2, md: 0 },
                      p: { xs: 2, md: 3 },
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      background: '#fafafa'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Facebook sx={{ color: '#1877f2', fontSize: { xs: 20, sm: 22, md: 24, lg: 28, xl: 32 } }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: '#333' }}>
                            Facebook
                          </Typography>
                          <Typography sx={{ color: '#666', fontSize: 14 }}>
                            {profileData?.facebookId ? t('profile.auth.connected') : t('profile.auth.notConnected')}
                          </Typography>
                        </Box>
                      </Box>
                                            <Button
                          variant="contained"
                          sx={{
                            background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                            color: '#fff',
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: { xs: 14, md: 15 },
                            px: { xs: 2, md: 3 },
                            py: 1.5,
                            height: 44,
                            boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                            textTransform: 'none',
                            minWidth: { xs: '100%', md: 120 },
                            '&:hover': {
                              background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                              transform: 'translateY(-1px)'
                            },
                          }}
                        >
                          {profileData?.facebookId ? t('profile.auth.disconnect') : t('profile.auth.connect')}
                        </Button>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        default:
          return null;
      }
    };
  
    // Проверяем, есть ли флаг skipReload, который указывает на то, что это перезагрузка для переключения вкладки
    const skipReload = localStorage.getItem('skipReload');
    
    // Если пользователь не загружен и нет флага skipReload, перенаправляем на главную
    if (!user && !skipReload) return <Navigate to="/" replace />;
    
    // Если пользователь не загружен, но есть флаг skipReload, показываем загрузку
    if (!user && skipReload) {
      return (
        <Container maxWidth="lg" disableGutters sx={{
          mt: 0,
          mb: 0,
          px: { xs: 0, md: 0 },
          minHeight: 'calc(100vh - var(--appbar-height) - 64px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pt: { xs: 'var(--appbar-height)', md: 'var(--appbar-height)' },
          pb: { xs: '64px', md: '64px' },
        }}>
          <CircularProgress />
        </Container>
      );
    }
    return (
      <>
        <Container maxWidth={false} disableGutters sx={{
          mt: 0,
          mb: 0,
          px: { xs: 0, md: 0 },
          minHeight: 'calc(100vh - var(--appbar-height) - 64px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          pt: { xs: 'var(--appbar-height)', md: 'var(--appbar-height)' },
          pb: { xs: '64px', md: '64px' }, // отступ снизу ровно над футером
          ml: { xs: 0, md: '2px' }, // сдвигаем вправо для десктопа (было 0px, теперь +2px)
        }}>
          <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Боковое меню */}
            <Box
              sx={{
                width: 260,
                flexShrink: 0,
                borderRight: '1px solid #eee',
                background: '#fafbfc',
                display: { xs: 'none', md: 'none', lg: 'block' },
                position: 'sticky',
                top: 'var(--appbar-height)',
                height: 'fit-content',
                mt: -11.5, // сдвигаем на 92px вверх (92px = 11.5 * 8px)
                alignSelf: 'flex-start',
                ml: { xs: 0, md: '2px' }, // дополнительный сдвиг вправо (было 0px, теперь +2px)
              }}
            >
              <Box sx={{ overflow: 'auto', pt: 2 }}>
                <List>
                  <ListItem 
                    button 
                    selected={selectedSection === 'myprofile'} 
                    onClick={() => setSelectedSection('myprofile')}
                    sx={selectedSection === 'myprofile' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.myProfile')} />
                  </ListItem>
                  <ListItem 
                    button 
                    selected={selectedSection === 'notifications'} 
                    onClick={() => setSelectedSection('notifications')}
                    sx={selectedSection === 'notifications' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><NotificationsIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.notifications')} />
                  </ListItem>
                  <ListItem 
                    button 
                    selected={selectedSection === 'orders'} 
                    onClick={() => setSelectedSection('orders')}
                    sx={selectedSection === 'orders' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.orders')} />
                  </ListItem>
                  <ListItem 
                    button 
                    selected={selectedSection === 'wishlist'} 
                    onClick={() => setSelectedSection('wishlist')}
                    sx={selectedSection === 'wishlist' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><FavoriteIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.wishlist')} />
                  </ListItem>
                  <ListItem 
                    button 
                    selected={selectedSection === 'viewed'} 
                    onClick={() => setSelectedSection('viewed')}
                    sx={selectedSection === 'viewed' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><VisibilityIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.viewed')} />
                  </ListItem>
                  <ListItem 
                    button 
                    selected={selectedSection === 'profile'} 
                    onClick={() => setSelectedSection('profile')}
                    sx={selectedSection === 'profile' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><PersonIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.personalData')} />
                  </ListItem>
                  <ListItem 
                    button 
                    selected={selectedSection === 'reviews'} 
                    onClick={() => setSelectedSection('reviews')}
                    sx={selectedSection === 'reviews' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><QuestionAnswerIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.reviews')} />
                  </ListItem>
                  <ListItem 
                    button 
                    selected={selectedSection === 'auth'} 
                    onClick={() => setSelectedSection('auth')}
                    sx={selectedSection === 'auth' ? {
                      backgroundColor: '#f5f5f5',
                      color: 'primary.main',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: 'primary.main' },
                      '&:hover': {
                        backgroundColor: '#f0f0f0',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    } : {
                      borderRadius: 2,
                      color: 'inherit',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#bdbdbd' },
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                      }
                    }}
                  >
                    <ListItemIcon><SettingsIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.authSettings')} />
                  </ListItem>
                  <ListItem 
                    button 
                    onClick={() => setLogoutDialogOpen(true)}
                    sx={{
                      borderRadius: 2,
                      color: '#f44336',
                      cursor: 'pointer',
                      '& .MuiListItemIcon-root': { color: '#f44336' },
                      '&:hover': {
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                        '& .MuiListItemIcon-root': { color: '#d32f2f' }
                      }
                    }}
                  >
                    <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                    <ListItemText primary={t('profile.menu.logout')} />
                  </ListItem>
                </List>
              </Box>
            </Box>
            {/* Контент */}
            <Box sx={{ 
               flex: 1, 
               p: { xs: 2, md: 2, lg: 2 }, 
               minHeight: 0, 
               ml: { xs: 0, md: 0, lg: 0 },
               width: { xs: '100%', md: '100%', lg: '100%' },
               maxWidth: { xs: '100%', md: '100%', lg: '100%' }
             }}>
              {renderSection()}
            </Box>
          </Box>
        </Container>
        {/* Диалог выхода */}
        <Dialog 
          open={logoutDialogOpen} 
          onClose={handleLogoutCancel}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 400,
              maxWidth: 500
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#333',
            borderBottom: '2px solid #f0f0f0',
            mb: 2
          }}>
              {t('profile.dialogs.logout.title')}
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
            <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5 }}>
              {t('profile.dialogs.logout.message')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
            <Button 
              onClick={handleLogoutCancel} 
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleLogoutConfirm} 
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('profile.dialogs.logout.confirm')}
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Диалог подтверждения удаления профиля */}
        <Dialog 
          open={deleteProfileDialogOpen} 
          onClose={handleDeleteProfileCancel}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 400,
              maxWidth: 500
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#d32f2f',
            borderBottom: '2px solid #ffebee',
            mb: 2
          }}>
              {t('profile.dialogs.deleteProfile.title')}
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
            <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5, mb: 2 }}>
              {t('profile.dialogs.deleteProfile.message')}
            </Typography>
            <Typography sx={{ 
              color: '#d32f2f', 
              fontSize: 14, 
              fontWeight: 500,
              backgroundColor: '#ffebee',
              padding: 2,
              borderRadius: 2,
              border: '1px solid #ffcdd2'
            }}>
              {t('profile.dialogs.deleteProfile.warning')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
            <Button 
              onClick={handleDeleteProfileCancel} 
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleDeleteProfileConfirm} 
              sx={{
                background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #b71c1c 0%, #8e0000 100%)',
                  boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Диалог подтверждения очистки списка желаний */}
        <Dialog 
          open={clearDialogOpen} 
          onClose={handleClearCancel}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 400,
              maxWidth: 500
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#333',
            borderBottom: '2px solid #f0f0f0',
            mb: 2
          }}>
              {t('profile.dialogs.clearWishlist.title')}
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
            <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5 }}>
              {t('profile.dialogs.clearWishlist.message')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
            <Button 
              onClick={handleClearCancel} 
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleClearConfirm} 
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('common.clear')}
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Диалог подтверждения очистки просмотренных товаров */}
        <Dialog 
          open={clearViewedDialogOpen} 
          onClose={handleClearViewedCancel}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              minWidth: 400,
              maxWidth: 500
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            pb: 1,
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#333',
            borderBottom: '2px solid #f0f0f0',
            mb: 2
          }}>
              {t('profile.dialogs.clearViewed.title')}
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
            <Typography sx={{ fontSize: 16, color: '#666', lineHeight: 1.5 }}>
              {t('profile.dialogs.clearViewed.message')}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 4, gap: 2 }}>
            <Button 
              onClick={handleClearViewedCancel} 
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleClearViewedConfirm} 
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600,
                fontSize: 15,
                px: 3,
                py: 1.5,
                height: 44,
                boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
                textTransform: 'none',
                minWidth: 120,
                '&:hover': {
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
                  transform: 'translateY(-1px)'
                },
              }}
              variant="contained"
            >
              {t('common.clear')}
            </Button>
          </DialogActions>
        </Dialog>
  
        <Snackbar open={profileSaved} autoHideDuration={3000} onClose={() => setProfileSaved(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ zIndex: 20000 }}>
          <Alert onClose={() => setProfileSaved(false)} severity="success" sx={{ width: '100%', fontWeight: 600, fontSize: 16 }}>
            {t('profile.toasts.profileSaved')}
          </Alert>
        </Snackbar>
        <Snackbar open={passwordSaved} autoHideDuration={3000} onClose={() => setPasswordSaved(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ zIndex: 20000 }}>
          <Alert onClose={() => setPasswordSaved(false)} severity="success" sx={{ width: '100%', fontWeight: 600, fontSize: 16 }}>
            {t('profile.toasts.passwordChanged')}
          </Alert>
        </Snackbar>
      </>
    );
  }

export default UserCabinetPage;