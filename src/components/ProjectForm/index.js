import React, { useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import cn from 'classnames'
import { get } from 'lodash'
import styles from './ProjectForm.module.scss'
import { PrimaryButton } from '../Buttons'
import Select from '../Select'
import { PROJECT_STATUSES, PROJECT_STATUS, DEFAULT_NDA_UUID } from '../../config/constants'
import GroupsFormField from './GroupsFormField'

const ProjectForm = ({
  projectTypes,
  createProject,
  updateProject,
  setActiveProject,
  history,
  isEdit,
  canManage,
  projectDetail
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isDirty, errors },
    watch
  } = useForm({
    defaultValues: {
      projectName: isEdit ? projectDetail.name : '',
      description: isEdit ? projectDetail.description : '',
      cancelReason: null,
      status: isEdit
        ? PROJECT_STATUSES.find((item) => item.value === projectDetail.status) ||
          null
        : null,
      projectType: isEdit
        ? projectTypes.find((item) => item.key === projectDetail.type) || null
        : null, // we'll store type as an object from react-select
      terms: get(projectDetail, ['terms', 0], ''),
      groups: get(projectDetail, ['groups'], [])
    }
  })

  const projectStatus = watch('status')
  const isProjectCancelled = get(projectStatus, 'value') === PROJECT_STATUS.CANCELLED

  // Handle form submission
  const onSubmit = async (data) => {
    // indicate that creating process has started
    setIsSaving(true)

    try {
      const status = canManage ? (data.status || {}).value : undefined
      const payload = {
        name: data.projectName,
        description: data.description,
        type: data.projectType.value,
        status,
        cancelReason: status === PROJECT_STATUS.CANCELLED ? data.cancelReason : undefined,
        groups: data.groups,
        terms: data.terms ? [data.terms] : []
      }

      if (isEdit) {
        await updateProject(projectDetail.id, payload)
      } else {
        const res = await createProject(payload)

        history.push(`/projects/${res.value.id}/challenges`)
        setActiveProject(res.value.id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
      reset(data)
    }
  }

  // Build options for react-select from `types`
  const projectTypeOptions = useMemo(() => projectTypes.map((t) => ({
    value: t.key,
    label: t.displayName
  })), [projectTypes])

  return (
    <div>
      <form
        name='project-new-form'
        noValidate
        autoComplete='off'
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={styles.group}>
          <div className={cn(styles.row, styles.topRow)}>
            <div className={cn(styles.formLabel, styles.field)}>
              <label label htmlFor='projectName'>
                Project Name <span>*</span> :
              </label>
            </div>
            <div className={cn(styles.field, styles.formField)}>
              <input
                className={styles.projectName}
                id='projectName'
                placeholder='Project name'
                {...register('projectName', {
                  required: 'Project name is required',
                  maxLength: {
                    value: 255,
                    message: 'Project name must be less than 255 characters'
                  }
                })}
              />
              {errors.projectName && (
                <div className={cn(styles.error)}>
                  {errors.projectName.message}
                </div>
              )}
            </div>
          </div>
          {isEdit && canManage && (
            <div className={cn(styles.row)}>
              <div className={cn(styles.formLabel, styles.field)}>
                <label label htmlFor='status'>
                  Project Status <span>*</span> :
                </label>
              </div>
              <div className={cn(styles.field, styles.formField)}>
                <Controller
                  name='status'
                  control={control}
                  rules={{ required: 'Please select a status' }}
                  render={({ field }) => (
                    <Select
                      options={PROJECT_STATUSES}
                      id='status'
                      {...field}
                      placeholder='Select Project Status'
                    />
                  )}
                />
                {errors.projectStatus && (
                  <div className={cn(styles.error)}>
                    {errors.projectStatus.message}
                  </div>
                )}
              </div>
            </div>
          )}
          {isEdit && isProjectCancelled && (
            <Controller
              name='cancelReason'
              control={control}
              rules={{ required: 'Please provide a cancellation reason' }}
              render={({ field }) => (
                <div className={cn(styles.row)}>
                  <div className={cn(styles.formLabel, styles.field)}>
                    <label label htmlFor='status'>
                      Cancel reason <span>*</span> :
                    </label>
                  </div>
                  <div className={cn(styles.field, styles.formField)}>
                    <input
                      className={styles.projectName}
                      id='cancelReason'
                      placeholder='Reason'
                      {...field}
                    />
                    {errors.projectStatus && (
                      <div className={cn(styles.error)}>
                        {errors.projectStatus.message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
          )}
          {!isEdit && (
            <div className={cn(styles.row)}>
              <div className={cn(styles.formLabel, styles.field)}>
                <label label htmlFor='projectType'>
                  Project Type <span>*</span> :
                </label>
              </div>
              <div className={cn(styles.field, styles.formField)}>
                <Controller
                  name='projectType'
                  control={control}
                  rules={{ required: 'Please select a type' }}
                  render={({ field }) => (
                    <Select
                      options={projectTypeOptions}
                      id='projectType'
                      {...field}
                      placeholder='Select Project Type'
                    />
                  )}
                />
                {errors.projectType && (
                  <div className={cn(styles.error)}>
                    {errors.projectType.message}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className={cn(styles.row)}>
            <div className={cn(styles.formLabel, styles.field)}>
              <label label htmlFor='description'>
                Description <span>*</span> :
              </label>
            </div>
            <div className={cn(styles.field, styles.formField)}>
              <textarea
                rows={4}
                className={styles.description}
                id='description'
                placeholder='Description'
                {...register('description', {
                  required: 'Description is required'
                })}
              />
              {errors.description && (
                <div className={cn(styles.error)}>
                  {errors.description.message}
                </div>
              )}
            </div>
          </div>
          <div className={cn(styles.row)}>
            <div className={cn(styles.formLabel, styles.field)}>
              <label label htmlFor='description'>
                Enforce Topcoder NDA:
              </label>
            </div>
            <div className={cn(styles.field, styles.formField, styles.flexField)}>
              <label className={cn(styles.flexRow)}>
                Yes
                <input
                  type='radio'
                  value={DEFAULT_NDA_UUID}
                  {...register('terms', {})}
                />
              </label>
              <label className={cn(styles.flexRow)}>
                No
                <input
                  type='radio'
                  value=''
                  {...register('terms', {})}
                />
              </label>
            </div>
          </div>
          <div className={cn(styles.row)}>
            <div className={cn(styles.formLabel, styles.field)}>
              <label label htmlFor='description'>
                Intended Work Groups:
              </label>
            </div>
            <div className={cn(styles.field, styles.formField)}>
              <Controller
                name='groups'
                control={control}
                render={({ field }) => (
                  <GroupsFormField {...field} />
                )}
              />
            </div>
          </div>
        </div>
        <div className={styles.actionButtons}>
          <PrimaryButton
            text={isSaving ? 'Saving...' : 'Save'}
            type={'info'}
            submit
            disabled={isSaving || !isDirty}
          />
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
