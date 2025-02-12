/**
 * IconFile component
 *
 * Renders file icon depend on the file type
 */
import React, { useMemo } from 'react'
import PT from 'prop-types'
import ReactSVG from 'react-svg'
import styles from './styles.module.scss'

const assets = require.context('../../../assets/images/files', false, /svg/)
const IconDefault = './default.svg'
const IconAac = './aac.svg'
const IconAi = './ai.svg'
const IconAse = './ase.svg'
const IconAsp = './asp.svg'
const IconAspx = './aspx.svg'
const IconAvi = './avi.svg'
const IconBmp = './bmp.svg'
const IconCpp = './c++.svg'
const IconCad = './cad.svg'
const IconCfm = './cfm.svg'
const IconCgi = './cgi.svg'
const IconCsh = './csh.svg'
const IconCss = './css.svg'
const IconCsv = './csv.svg'
const IconDmg = './dmg.svg'
const IconDoc = './doc.svg'
const IconDocx = './docx.svg'
const IconEps = './eps.svg'
const IconEpub = './epub.svg'
const IconExe = './exe.svg'
const IconFlash = './flash.svg'
const IconFlv = './flv.svg'
const IconFont = './font.svg'
const IconGif = './gif.svg'
const IconGpx = './gpx.svg'
const IconGzip = './gzip.svg'
const IconHtml = './html.svg'
const IconIcs = './ics.svg'
const IconIso = './iso.svg'
const IconJar = './jar.svg'
const IconJava = './java.svg'
const IconJpg = './jpg.svg'
const IconJs = './js.svg'
const IconJsp = './jsp.svg'
const IconLog = './log.svg'
const IconMax = './max.svg'
const IconMd = './md.svg'
const IconMkv = './mkv.svg'
const IconMov = './mov.svg'
const IconMp3 = './mp3.svg'
const IconMp4 = './mp4.svg'
const IconMpg = './mpg.svg'
const IconObj = './obj.svg'
const IconOtf = './otf.svg'
const IconPdf = './pdf.svg'
const IconPhp = './php.svg'
const IconPng = './png.svg'
const IconPptx = './pptx.svg'
const IconPsd = './psd.svg'
const IconPy = './py.svg'
const IconRar = './rar.svg'
const IconRaw = './raw.svg'
const IconRb = './rb.svg'
const IconRss = './rss.svg'
const IconRtf = './rtf.svg'
const IconSketch = './sketch.svg'
const IconSql = './sql.svg'
const IconSrt = './srt.svg'
const IconSvg = './svg.svg'
const IconTif = './tif.svg'
const IconTiff = './tiff.svg'
const IconTtf = './ttf.svg'
const IconTxt = './txt.svg'
const IconWav = './wav.svg'
const IconXlsx = './xlsx.svg'
const IconXml = './xml.svg'
const IconZip = './zip.svg'
const IconLink12 = './link-12.svg'

const IconFile = ({ type }) => {
  const icon = useMemo(() => {
    // if type is defined as a relative path to the icon, convert it to icon "id"
    let iconType = type
    const typeAsPath =
      type && type.match(/(?:\.\.\/)+assets\/icons\/([^.]+)\.svg/)
    if (typeAsPath) {
      iconType = typeAsPath[1]
    }

    switch (iconType) {
      case 'aac':
        return IconAac
      case 'ai':
        return IconAi
      case 'ase':
        return IconAse
      case 'asp':
        return IconAsp
      case 'aspx':
        return IconAspx
      case 'avi':
        return IconAvi
      case 'bmp':
        return IconBmp
      case 'c++':
        return IconCpp
      case 'cad':
        return IconCad
      case 'cfm':
        return IconCfm
      case 'cgi':
        return IconCgi
      case 'csh':
        return IconCsh
      case 'css':
        return IconCss
      case 'csv':
        return IconCsv
      case 'dmg':
        return IconDmg
      case 'doc':
        return IconDoc
      case 'docx':
        return IconDocx
      case 'eps':
        return IconEps
      case 'epub':
        return IconEpub
      case 'exe':
        return IconExe
      case 'flash':
        return IconFlash
      case 'flv':
        return IconFlv
      case 'font':
        return IconFont
      case 'gif':
        return IconGif
      case 'gpx':
        return IconGpx
      case 'gzip':
        return IconGzip
      case 'html':
        return IconHtml
      case 'ics':
        return IconIcs
      case 'iso':
        return IconIso
      case 'jar':
        return IconJar
      case 'java':
        return IconJava
      case 'jpg':
        return IconJpg
      case 'js':
        return IconJs
      case 'jsp':
        return IconJsp
      case 'log':
        return IconLog
      case 'max':
        return IconMax
      case 'md':
        return IconMd
      case 'mkv':
        return IconMkv
      case 'mov':
        return IconMov
      case 'mp3':
        return IconMp3
      case 'mp4':
        return IconMp4
      case 'mpg':
        return IconMpg
      case 'obj':
        return IconObj
      case 'otf':
        return IconOtf
      case 'pdf':
        return IconPdf
      case 'php':
        return IconPhp
      case 'png':
        return IconPng
      case 'pptx':
        return IconPptx
      case 'psd':
        return IconPsd
      case 'py':
        return IconPy
      case 'rar':
        return IconRar
      case 'raw':
        return IconRaw
      case 'rb':
        return IconRb
      case 'rss':
        return IconRss
      case 'rtf':
        return IconRtf
      case 'sketch':
        return IconSketch
      case 'sql':
        return IconSql
      case 'srt':
        return IconSrt
      case 'svg':
        return IconSvg
      case 'tif':
        return IconTif
      case 'tiff':
        return IconTiff
      case 'ttf':
        return IconTtf
      case 'txt':
        return IconTxt
      case 'wav':
        return IconWav
      case 'xlsx':
        return IconXlsx
      case 'xml':
        return IconXml
      case 'zip':
        return IconZip
      case 'link-12':
        return IconLink12
      default:
        // this will be default icon
        return IconDefault
    }
  }, [type])

  return <ReactSVG className={styles.icon} path={assets(icon)} />
}

IconFile.propTypes = {
  type: PT.string
}

export default IconFile
