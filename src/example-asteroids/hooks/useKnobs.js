import React, { useState } from 'react';

function Knob({ name, value, onChange, min = 1, max = 500, step = 1 }) {
  return (
    <label>
      {name}: {value}
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  )
}

export function useKnobs(initialValues, options) {
  const [values, setValues] = useState(initialValues)
  return [
    values,
    <div
      style={{
        width: 225,
        zIndex: 999999,
        backgroundColor: 'rgba(255,255,255,0.75)',
        position: 'absolute',
      }}>
      {Object.keys(values).map(name => (
        <Knob
          {...options}
          key={name}
          name={name}
          min={0}
          max={1}
          step={0.01}
          value={values[name]}
          onChange={newValue =>
            setValues({
              ...values,
              [name]: newValue,
            })
          }
        />
      ))}
    </div>,
  ]
}
