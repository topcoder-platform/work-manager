import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useFormik, FormikProvider, FieldArray } from 'formik'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import _ from 'lodash'
import PropTypes from 'prop-types'
import ReactSVG from 'react-svg'
import cn from 'classnames'
import { toastr } from 'react-redux-toastr'

import FieldLabelDynamic from '../../components/FieldLabelDynamic'
import Loader from '../../components/Loader'
import FieldSkillsBasic from '../../components/FieldSkillsBasic'
import FieldInput from '../../components/FieldInput'
import FieldDescription from '../../components/FieldDescription'
import { OutlineButton } from '../../components/Buttons'
import { setActiveProject } from '../../actions/sidebar'
import { JOB_ROLE_OPTIONS, JOB_WORKLOAD_OPTIONS } from '../../config/constants'
import { taaSProjectFormValidationSchema } from '../../util/validation'
import { createProjectApi } from '../../services/projects'
import { loadOnlyProjectInfo, updateProject } from '../../actions/projects'
import ProjectStatus from '../../components/ChallengesComponent/ProjectStatus'

import styles from './styles.module.scss'
import Select from '../../components/Select'

const assets = require.context('../../assets/images', false, /svg/)
const iconPlus = './plus-gray.svg'
const iconX = './x-gray.svg'

const defaultJob = {
  title: '',
  role: JOB_ROLE_OPTIONS[0],
  workLoad: JOB_WORKLOAD_OPTIONS[0],
  skills: [],
  description: '',
  people: 0,
  duration: 0
}

const TaaSProjectForm = ({
  setActiveProject,
  history,
  projectId,
  loadOnlyProjectInfo,
  projectDetail,
  isUpdating,
  updateProject
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const isCreateNewProject = useMemo(() => !projectId, [projectId])
  const canShowEditForm = useMemo(() => {
    if (projectId) {
      return projectId === `${projectDetail.id}`
    }
    return true
  }, [projectDetail, projectId])
  const [initValues, setInitValues] = useState({
    name: '',
    jobs: []
  })

  const formik = useFormik({
    initialValues: initValues,
    enableReinitialize: true,
    validationSchema: taaSProjectFormValidationSchema,
    onSubmit: values => {
      const jobs = values.jobs.map(item => ({
        ...item,
        people: `${item.people}`,
        duration: `${item.duration}`,
        role: {
          value: item.role.value,
          title: item.role.label
        },
        workLoad: {
          value: item.workLoad.value,
          title: item.workLoad.label
        }
      }))
      if (isCreateNewProject) {
        const createFormData = {
          details: {
            intakePurpose: 'internal-project',
            utm: {
              code: ''
            },
            taasDefinition: {
              taasJobs: jobs,
              kickOffTime: '',
              oppurtunityDetails: {
                customerName: '',
                staffingModel: '',
                talentLocation: '',
                workingTimezone: '',
                requestedStartDate: ''
              },
              otherRequirements: [],
              otherRequirementBrief: '',
              hiringManager: ''
            }
          },
          type: 'talent-as-a-service',
          templateId: 250,
          name: values.name,
          version: 'v4',
          estimation: [],
          attachments: []
        }
        setIsLoading(true)
        createProjectApi(createFormData)
          .then(result => {
            setIsLoading(false)
            history.push(`/taas/${result.id}/edit`)
            setActiveProject(parseInt(result.id))
          })
          .catch(e => {
            setIsLoading(false)
            const errorMessage = _.get(
              e,
              'response.data.message',
              'Failed to create project'
            )
            toastr.error('Error', errorMessage)
          })
      } else if (formik.dirty) {
        const updateFormData = {
          details: {
            taasDefinition: {
              taasJobs: jobs
            }
          },
          name: values.name
        }
        updateProject(projectId, updateFormData)
      }
    }
  })

  const updateFormField = useCallback(
    (fieldName, newValue) => {
      formik.setFieldTouched(fieldName)
      formik.setFieldValue(fieldName, newValue)
    },
    [formik]
  )

  useEffect(() => {
    const taasJobs = _.get(projectDetail, 'details.taasDefinition.taasJobs')
    if (
      projectDetail &&
      projectId &&
      projectId === `${projectDetail.id}` &&
      taasJobs
    ) {
      setInitValues({
        name: projectDetail.name,
        jobs: _.cloneDeep(taasJobs).map(item => ({
          title: item.title,
          people: parseInt(item.people),
          duration: parseInt(item.duration),
          description: item.description,
          role: {
            value: item.role.value,
            label: item.role.title
          },
          workLoad: {
            value: (item.workLoad || {}).value,
            label: (item.workLoad || {}).title
          },
          skills: item.skills
        }))
      })
    }
  }, [projectDetail, projectId])

  useEffect(() => {
    if (projectId) {
      loadOnlyProjectInfo(projectId)
    } else {
      setInitValues({
        name: '',
        jobs: [_.cloneDeep(defaultJob)]
      })
    }
  }, [projectId])

  const getFormError = useCallback(
    fieldName => {
      return _.get(formik.touched, fieldName) ? _.get(formik.errors, fieldName) : ''
    },
    [formik]
  )

  return (
    <div className={styles.wrapper}>
      <div className={styles.topContainer}>
        <div className={styles.leftContainer}>
          <div className={styles.title}>
            {isCreateNewProject ? 'Create TaaS Project' : 'Edit TaaS Project'}
            {projectDetail && projectDetail.status && (
              <ProjectStatus className={styles.status} status={projectDetail.status} />
            )}
          </div>
        </div>
      </div>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          {canShowEditForm ? (
            <>
              <div className={styles.textRequired}>* Required</div>
              <FormikProvider value={formik}>
                <form onSubmit={formik.handleSubmit}>
                  <div
                    className={cn(
                      styles.newFormContainer,
                      styles.blockFormColumn
                    )}
                  >
                    <FieldLabelDynamic
                      direction='vertical'
                      title='Title of your project'
                      errorMsg={getFormError('name')}
                      isRequired
                    >
                      <FieldInput
                        value={formik.values.name || ''}
                        onChangeValue={newValue => {
                          updateFormField('name', newValue)
                        }}
                      />
                    </FieldLabelDynamic>
                    <FieldArray
                      name='jobs'
                      render={arrayHelpers => (
                        <FieldLabelDynamic
                          direction='vertical'
                          title='Jobs'
                          isRequired
                          info='If you have multiple open positions with different skills engagement duration requirements, click the + sign to the right and enter each role individually'
                        >
                          <div
                            className={cn(
                              styles.blockJobsContainer,
                              styles.blockFormColumn
                            )}
                          >
                            {formik.values.jobs.map((job, index) => (
                              <div
                                key={index}
                                className={cn(
                                  styles.blockJobContainer,
                                  styles.blockFormColumn
                                )}
                              >
                                <div className={styles.blockFormRow}>
                                  <FieldLabelDynamic
                                    title={`JOB ${index + 1}`}
                                    errorMsg={getFormError(
                                      `jobs[${index}].title`
                                    )}
                                    isRequired
                                    className={styles.blockField}
                                  >
                                    <FieldInput
                                      value={job.title}
                                      onChangeValue={newValue => {
                                        updateFormField(
                                          `jobs[${index}].title`,
                                          newValue
                                        )
                                      }}
                                    />
                                  </FieldLabelDynamic>

                                  <div className={styles.btnsAdd}>
                                    {formik.values.jobs.length < 10 && (
                                      <button
                                        type='button'
                                        className={styles.btnAdd}
                                        onClick={() =>
                                          arrayHelpers.push(
                                            _.cloneDeep(defaultJob)
                                          )
                                        }
                                      >
                                        <ReactSVG
                                          className={styles.iconPlus}
                                          path={assets(iconPlus)}
                                        />
                                      </button>
                                    )}
                                    {index !== 0 && (
                                      <button
                                        type='button'
                                        className={styles.btnAdd}
                                        onClick={() => arrayHelpers.remove(index)}
                                      >
                                        <ReactSVG
                                          className={styles.iconPlus}
                                          path={assets(iconX)}
                                        />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <div className={styles.blockFormRow}>
                                  <FieldLabelDynamic
                                    direction='vertical'
                                    title='NUMBER OF PEOPLE'
                                    errorMsg={getFormError(
                                      `jobs[${index}].people`
                                    )}
                                    isRequired
                                    className={styles.blockField}
                                  >
                                    <FieldInput
                                      value={job.people}
                                      onChangeValue={newValue => {
                                        updateFormField(
                                          `jobs[${index}].people`,
                                          newValue
                                        )
                                      }}
                                      type='number'
                                    />
                                  </FieldLabelDynamic>

                                  <FieldLabelDynamic
                                    direction='vertical'
                                    title='ROLE'
                                    errorMsg={getFormError(`jobs[${index}].role`)}
                                    isRequired
                                    className={styles.blockField}
                                  >
                                    <Select
                                      options={JOB_ROLE_OPTIONS}
                                      placeholder='Select Role'
                                      value={job.role}
                                      isClearable={false}
                                      onChange={newValue => {
                                        updateFormField(
                                          `jobs[${index}].role`,
                                          newValue
                                        )
                                      }}
                                    />
                                  </FieldLabelDynamic>
                                </div>

                                <div className={styles.blockFormRow}>
                                  <FieldLabelDynamic
                                    direction='vertical'
                                    title='DURATION (WEEKS)'
                                    errorMsg={getFormError(
                                      `jobs[${index}].duration`
                                    )}
                                    isRequired
                                    className={styles.blockField}
                                  >
                                    <FieldInput
                                      value={job.duration}
                                      onChangeValue={newValue => {
                                        updateFormField(
                                          `jobs[${index}].duration`,
                                          newValue
                                        )
                                      }}
                                      type='number'
                                    />
                                  </FieldLabelDynamic>

                                  <FieldLabelDynamic
                                    direction='vertical'
                                    title='WORKLOAD'
                                    errorMsg={getFormError(
                                      `jobs[${index}].workLoad`
                                    )}
                                    isRequired
                                    className={styles.blockField}
                                  >
                                    <Select
                                      options={JOB_WORKLOAD_OPTIONS}
                                      placeholder='Select Workload'
                                      value={job.workLoad}
                                      isClearable={false}
                                      onChange={newValue => {
                                        updateFormField(
                                          `jobs[${index}].workLoad`,
                                          newValue
                                        )
                                      }}
                                    />
                                  </FieldLabelDynamic>
                                </div>

                                <FieldLabelDynamic
                                  direction='vertical'
                                  title='JOB DESCRIPTION'
                                  errorMsg={getFormError(
                                    `jobs[${index}].description`
                                  )}
                                >
                                  <FieldDescription
                                    value={job.description}
                                    onChange={newValue => {
                                      updateFormField(
                                        `jobs[${index}].description`,
                                        newValue
                                      )
                                    }}
                                    placeholder='Job Description'
                                  />
                                </FieldLabelDynamic>

                                <FieldLabelDynamic
                                  direction='vertical'
                                  title='SKILLS'
                                  errorMsg={getFormError(`jobs[${index}].skills`)}
                                  isRequired
                                >
                                  <FieldSkillsBasic
                                    value={job.skills}
                                    onChangeValue={newValue => {
                                      updateFormField(
                                        `jobs[${index}].skills`,
                                        newValue
                                      )
                                    }}
                                    placeholder='Start typing a skill then select from the list'
                                  />
                                </FieldLabelDynamic>
                              </div>
                            ))}
                          </div>
                        </FieldLabelDynamic>
                      )}
                    />
                  </div>

                  <div className={styles.buttonContainer}>
                    <div className={styles.button}>
                      <OutlineButton
                        text={isCreateNewProject ? 'Create' : 'Update'}
                        type='success'
                        submit
                        disabled={isLoading || isUpdating}
                      />
                    </div>
                  </div>
                </form>
              </FormikProvider>
            </>
          ) : (
            <Loader />
          )}
        </div>
      </div>
    </div>
  )
}

TaaSProjectForm.propTypes = {
  projectDetail: PropTypes.object,
  loadOnlyProjectInfo: PropTypes.func.isRequired,
  updateProject: PropTypes.func.isRequired,
  setActiveProject: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  projectId: PropTypes.string,
  isUpdating: PropTypes.bool.isRequired
}

const mapStateToProps = ({ projects }) => {
  return {
    projectDetail: projects.projectDetail,
    isUpdating: projects.isUpdating
  }
}

const mapDispatchToProps = {
  loadOnlyProjectInfo,
  setActiveProject,
  updateProject
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(TaaSProjectForm)
)
