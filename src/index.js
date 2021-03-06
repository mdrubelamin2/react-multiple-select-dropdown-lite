import React, { useState, useEffect } from 'react'
import CloseIcon from './CloseIcon.jsx'
import DownIcon from './DownIcon.jsx'
import './styles.css'

MultiSelect.defaultProps = {
  clearable: true,
  downArrow: true,
  width: 300,
  singleSelect: false,
  jsonValue: false,
  defaultValue: '',
  disableChip: false,
  name: '',
  disabled: false,
  limit: null,
  placeholder: 'Select...',
  onChange: () => {},
  options: [
    {
      label: 'Empty',
      value: '',
      disabled: true,
      style: { textAlign: 'center' }
    }
  ]
}

function MultiSelect({
  options,
  width,
  downArrowIcon,
  closeIcon,
  clearable,
  downArrow,
  onChange,
  singleSelect,
  jsonValue,
  defaultValue,
  className,
  placeholder,
  disableChip,
  name,
  attr,
  disabled,
  limit
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [value, setValue] = useState([])
  console.log('init', value)
  let stopPropagation = true

  if (options === null || options === '' || options === false) {
    options = []
  }

  useEffect(() => {
    let preDefinedValue = []
    if (defaultValue !== '' || defaultValue.length > 0) {
      if (typeof defaultValue === 'string') {
        const valueArr = defaultValue.split(',')
        preDefinedValue = options.filter(
          (itm) => valueArr.indexOf(itm.value) !== -1
        )
        if (singleSelect && preDefinedValue.length > 1) {
          preDefinedValue = [preDefinedValue[0]]
        }
      } else if (
        Array.isArray(defaultValue) &&
        defaultValue.length > 0 &&
        typeof defaultValue[0] !== 'string'
      ) {
        preDefinedValue = options.filter((opt) =>
          defaultValue.some((pval) => opt.value === pval.value)
        )
        if (singleSelect && preDefinedValue.length > 1) {
          preDefinedValue = [preDefinedValue[0]]
        }
      } else if (Array.isArray(defaultValue) && defaultValue.length > 0) {
        preDefinedValue = options.filter((opt) =>
          defaultValue.some((pval) => opt.value === pval)
        )
        if (singleSelect && preDefinedValue.length > 1) {
          preDefinedValue = [preDefinedValue[0]]
        }
      }
    }
    setValue(preDefinedValue)
  }, [])

  const printOptions = (opts) => {
    const optsArr = []
    function addInArr(opts) {
      for (const [i, opt] of opts.entries()) {
        if (opt.type === 'group') {
          optsArr.push(
            <div key={opt.title + i} data-msl className='msl-grp-title'>
              {opt.title}
            </div>
          )
          addInArr(opt.childs)
        } else {
          optsArr.push(
            <option
              key={opt.value + opt.label + i + 10}
              {...(!singleSelect && { 'data-msl': true })}
              style={{
                ...(opt.style && opt.style)
              }}
              onClick={() => {
                !opt.disabled && addValue(opt)
              }}
              title={opt.label}
              className={`msl-option ${
                checkValueExist(opt, value) ? 'msl-option-active' : ''
              } ${opt.disabled ? 'msl-option-disable' : ''} ${
                opt.classes !== undefined ? opt.classes : ''
              }`}
              value={opt.value}
            >
              {opt.label}
            </option>
          )
        }
      }
    }
    addInArr(opts)
    return optsArr
  }

  const setNewValue = (val) => {
    setValue(val)
    if (jsonValue) {
      onChange(val)
    } else {
      let stringvalue = ''
      stringvalue += val.map((itm) => itm.value)
      onChange(stringvalue)
    }
  }

  const openMenu = () => {
    setMenuOpen(true)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  const inputRefFocus = (e, focus) => {
    let parentNode = null
    let inputNode = null
    if (e.target.hasAttribute('data-msl')) {
      parentNode = e.target
    } else if (e.target.parentNode.hasAttribute('data-msl')) {
      parentNode = e.target.parentNode
    } else if (e.target.parentNode.parentNode.hasAttribute('data-msl')) {
      parentNode = e.target.parentNode.parentNode
    } else if (
      e.target.parentNode.parentNode.parentNode.hasAttribute('data-msl')
    ) {
      parentNode = e.target.parentNode.parentNode.parentNode
    } else if (
      e.target.parentNode.parentNode.parentNode.parentNode.hasAttribute(
        'data-msl'
      )
    ) {
      parentNode = e.target.parentNode.parentNode.parentNode.parentNode
    }
    if (parentNode !== null) {
      inputNode = parentNode.querySelector('.msl-input')
    }

    if (inputNode !== null) {
      focus ? inputNode.focus() : inputNode.blur()
    }
  }

  const handleMenuBtn = (e) => {
    stopPropagation = false
    if (menuOpen) {
      document.removeEventListener('click', handleMenu)
      inputRefFocus(e, false)
      closeMenu()
    } else {
      inputRefFocus(e, true)
      openMenu()
      document.addEventListener('click', handleMenu)
    }
  }

  const handleMenu = (e) => {
    if (!openable(e)) {
      document.removeEventListener('click', handleMenu)
      closeMenu()
    } else {
      openMenu()
    }
  }

  const openable = (e) => {
    if (e.target.hasAttribute('data-msl')) {
      return true
    }
    return false
  }

  const handleOutsideClick = (e) => {
    if (openable(e)) {
      if (!menuOpen) {
        document.addEventListener('click', handleOutsideClick)
      }
      inputRefFocus(e, true)
      openMenu()
    } else {
      closeMenu()
      document.removeEventListener('click', handleOutsideClick)
    }
  }

  const handleClickInput = (e) => {
    if (stopPropagation) {
      handleOutsideClick(e)
    }
  }

  const checkValueExist = (value, arr) => {
    const a = arr.some((itm) => itm.value === value.value)
    return a
  }

  const addValue = (newValObj) => {
    console.log(newValObj)
    let tmp = [...value]
    if (singleSelect) {
      tmp = [newValObj]
    } else {
      if (!checkValueExist(newValObj, value)) {
        console.log('not exists')
        if (limit === null) {
          console.log('pyushed')
          tmp.push(newValObj)
        } else if (limit > value.length) {
          tmp.push(newValObj)
        }
      } else {
        tmp = tmp.filter((itm) => itm.value !== newValObj.value)
      }
    }
    setNewValue(tmp)
  }

  const deleteValue = (i) => {
    const tmp = [...value]
    tmp.splice(i, 1)
    setNewValue(tmp)
  }

  const clearValue = () => {
    setNewValue([])
  }

  const showSearchOption = () => {
    if (!singleSelect && !disableChip) {
      return true
    } else if (singleSelect && !value.length) {
      return true
    } else if (!singleSelect && disableChip && !value.length) {
      return true
    }
    return false
  }

  return (
    <div
      {...attr}
      onClick={handleClickInput}
      style={{ width }}
      className={`msl-wrp msl-vars ${className} ${
        disabled ? 'msl-disabled' : ''
      }`}
    >
      <input name={name} type='hidden' value={value.map((itm) => itm.value)} />
      <div data-msl className={`msl ${menuOpen ? 'msl-active' : ''} `}>
        <div
          data-msl
          className='msl-input-wrp'
          style={{
            marginRight:
              clearable && downArrow ? 60 : downArrow || clearable ? 40 : 5
          }}
        >
          {!singleSelect &&
            !disableChip &&
            value.map((val, i) => (
              <div key={`msl-chip-${i + 11}`} className='msl-chip'>
                {val.label}
                <div
                  role='button'
                  aria-label='delete-value'
                  onClick={() => deleteValue(i)}
                  className='msl-btn msl-chip-delete msl-flx'
                >
                  <CloseIcon />
                </div>
                <span />
              </div>
            ))}
          {!singleSelect && disableChip && value.length === 1 ? (
            <span
              className='msl-single-value'
              data-msl
              style={{
                width:
                  width -
                  (clearable && downArrow
                    ? 60
                    : downArrow || clearable
                    ? 40
                    : 5)
              }}
            >
              {value[0].label}d
            </span>
          ) : (
            disableChip &&
            value.length > 1 && (
              <span
                className='msl-single-value'
                data-msl
                style={{
                  width:
                    width -
                    (clearable && downArrow
                      ? 60
                      : downArrow || clearable
                      ? 40
                      : 5)
                }}
              >
                {value.length} Selected
              </span>
            )
          )}
          {singleSelect && value.length === 1 && (
            <span
              className='msl-single-value'
              data-msl
              style={{
                width:
                  width -
                  (clearable && downArrow
                    ? 60
                    : downArrow || clearable
                    ? 40
                    : 5)
              }}
            >
              {value[0].label}
            </span>
          )}
          {showSearchOption() && (
            <div
              data-msl
              data-placeholder={placeholder}
              className='msl-input'
              contentEditable={!disabled}
            />
          )}
        </div>
        {(clearable || downArrow) && (
          <div className='msl-actions msl-flx'>
            {clearable && value.length > 0 && (
              <div
                role='button'
                aria-label='close-menu'
                onClick={clearValue}
                className='msl-btn msl-clear-btn msl-flx'
              >
                {closeIcon || <CloseIcon />}
              </div>
            )}
            {downArrow && (
              <div
                role='button'
                aria-label='toggle-menu'
                onClick={handleMenuBtn}
                className='msl-btn msl-arrow-btn msl-flx'
                style={{ ...(menuOpen && { transform: 'rotate(180deg)' }) }}
              >
                {downArrowIcon || <DownIcon />}
              </div>
            )}
          </div>
        )}
      </div>
      <div className='msl-options'>
        {printOptions(options)}
        {/* {options.map((opt, i) => (
          <option
            {...(!singleSelect && { 'data-msl': true })}
            style={{ ...(opt.style && opt.style) }}
            onClick={() => {
              !opt.disabled && addValue(i)
            }}
            title={opt.label}
            key={opt.value + i + 10}
            className={`msl-option ${
              checkValueExist(opt, value) ? 'msl-option-active' : ''
            } ${opt.disabled ? 'msl-option-disable' : ''} ${
              opt.classes !== undefined ? opt.classes : ''
            }`}
            value={opt.value}
          >
            {opt.label}
          </option>
        ))} */}
      </div>
    </div>
  )
}

export default MultiSelect
