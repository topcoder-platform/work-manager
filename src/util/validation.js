import _ from 'lodash'
import * as Yup from 'yup'

/**
 * check if selected value is valid
 * @param {Object | null | undefined} selectValue select value
 * @returns is valid select value
 */
export function isValidSelect (selectValue) {
  return !!selectValue && !!selectValue.value
}

/**
 * check if value is number
 * @param {String | null | undefined} value value
 * @returns is valid number value
 */
export function isValidNumber (value) {
  return _.isNumber(value)
}

/**
 * validation schema for taaS project form
 */
export const taaSProjectFormValidationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Please enter project title'),
  jobs: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Please enter job title'),
      people: Yup.number()
        .min(1, 'Please choose at least one people')
        .test('number', 'Please choose at least one people', isValidNumber),
      role: Yup.object().test('role', 'Please choose role', isValidSelect),
      duration: Yup.number()
        .min(4, 'Please, choose at least 4 weeks')
        .test('number', 'Please choose at least 4 weeks', isValidNumber),
      workLoad: Yup.object().test(
        'workLoad',
        'Please, choose workLoad',
        isValidSelect
      ),
      description: Yup.string().required('Please enter a job description'),
      skills: Yup.array()
        .of(
          Yup.object().shape({
            name: Yup.string(),
            skillId: Yup.string()
          })
        )
        .required('Required', 'Please choose at least one skill.')
        .min(1, 'Please choose at least one skill.')
    })
  )
})
