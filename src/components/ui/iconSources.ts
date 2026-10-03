import home from "@/assets/icons/home.svg";
import care from "@/assets/icons/care.svg";
import news from "@/assets/icons/news.svg";
import family from "@/assets/icons/family.svg";
import grid from "@/assets/icons/grid.svg";
import chevronRight from "@/assets/icons/chevron-right.svg";
import chevronLeft from "@/assets/icons/chevron-left.svg";
import chevronDown from "@/assets/icons/chevron-down.svg";
import plus from "@/assets/icons/plus.svg";
import check from "@/assets/icons/check.svg";
import close from "@/assets/icons/close.svg";
import edit from "@/assets/icons/edit.svg";
import info from "@/assets/icons/info.svg";
import alert from "@/assets/icons/alert.svg";
import lock from "@/assets/icons/lock.svg";
import clock from "@/assets/icons/clock.svg";
import link from "@/assets/icons/link.svg";
import person from "@/assets/icons/person.svg";
import arrowRight from "@/assets/icons/arrow-right.svg";
import refresh from "@/assets/icons/refresh.svg";
import spinner from "@/assets/icons/spinner.svg";
import homeBrand from "@/assets/icons/home-brand.svg";
import homeSecondary from "@/assets/icons/home-secondary.svg";
import careSecondary from "@/assets/icons/care-secondary.svg";
import newsSecondary from "@/assets/icons/news-secondary.svg";
import familySecondary from "@/assets/icons/family-secondary.svg";
import gridSecondary from "@/assets/icons/grid-secondary.svg";
import careBrand from "@/assets/icons/care-brand.svg";
import newsBrand from "@/assets/icons/news-brand.svg";
import familyBrand from "@/assets/icons/family-brand.svg";
import gridBrand from "@/assets/icons/grid-brand.svg";
import checkInverse from "@/assets/icons/check-inverse.svg";
import checkDisabled from "@/assets/icons/check-disabled.svg";
import personBrand from "@/assets/icons/person-brand.svg";
import chevronRightSecondary from "@/assets/icons/chevron-right-secondary.svg";
import personError from "@/assets/icons/person-error.svg";
import infoBrand from "@/assets/icons/info-brand.svg";
import infoSecondary from "@/assets/icons/info-secondary.svg";
import alertError from "@/assets/icons/alert-error.svg";
import refreshError from "@/assets/icons/refresh-error.svg";
import lockSecondary from "@/assets/icons/lock-secondary.svg";
import arrowRightSecondary from "@/assets/icons/arrow-right-secondary.svg";
import google from "@/assets/icons/google.svg";
import kakao from "@/assets/icons/kakao.svg";
import chevronLeftDisabled from "@/assets/icons/chevron-left-disabled.svg";
import chevronDownSecondary from "@/assets/icons/chevron-down-secondary.svg";
import spinnerBrand from "@/assets/icons/spinner-brand.svg";
import spinnerInverse from "@/assets/icons/spinner-inverse.svg";
import spinnerSecondary from "@/assets/icons/spinner-secondary.svg";

export const iconSources = {
  home: home,
  care: care,
  news: news,
  family: family,
  grid: grid,
  "chevron-right": chevronRight,
  "chevron-left": chevronLeft,
  "chevron-down": chevronDown,
  plus: plus,
  check: check,
  close: close,
  edit: edit,
  info: info,
  alert: alert,
  lock: lock,
  clock: clock,
  link: link,
  person: person,
  "arrow-right": arrowRight,
  refresh: refresh,
  spinner: spinner,
  "home-brand": homeBrand,
  "home-secondary": homeSecondary,
  "care-secondary": careSecondary,
  "news-secondary": newsSecondary,
  "family-secondary": familySecondary,
  "grid-secondary": gridSecondary,
  "care-brand": careBrand,
  "news-brand": newsBrand,
  "family-brand": familyBrand,
  "grid-brand": gridBrand,
  "check-inverse": checkInverse,
  "check-disabled": checkDisabled,
  "person-brand": personBrand,
  "chevron-right-secondary": chevronRightSecondary,
  "person-error": personError,
  "info-brand": infoBrand,
  "info-secondary": infoSecondary,
  "alert-error": alertError,
  "refresh-error": refreshError,
  "lock-secondary": lockSecondary,
  "arrow-right-secondary": arrowRightSecondary,
  google: google,
  kakao: kakao,
  "chevron-left-disabled": chevronLeftDisabled,
  "chevron-down-secondary": chevronDownSecondary,
  "spinner-brand": spinnerBrand,
  "spinner-inverse": spinnerInverse,
  "spinner-secondary": spinnerSecondary,
} as const;

export type IconName = keyof typeof iconSources;
export const iconNames = Object.keys(iconSources) as IconName[];
