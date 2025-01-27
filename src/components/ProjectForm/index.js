import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import cn from 'classnames'
import styles from './ProjectForm.module.scss'
import { PrimaryButton } from '../Buttons'
import Select from '../Select'
import { PROJECT_STATUS } from '../../config/constants'

const ProjectForm = ({
  projectTypes,
  createProject,
  updateProject,
  setActiveProject,
  history,
  isEdit,
  projectDetail
}) => {
  const [isSaving, setIsSaving] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    defaultValues: {
      projectName: isEdit ? projectDetail.name : '',
      description: isEdit ? projectDetail.description : '',
      status: isEdit
        ? PROJECT_STATUS.find((item) => item.value === projectDetail.status) ||
          null
        : null,
      projectType: isEdit
        ? projectTypes.find((item) => item.key === projectDetail.type) || null
        : null // we'll store type as an object from react-select
    }
  })

  // Handle form submission
  const onSubmit = async (data) => {
    // indicate that creating process has started
    setIsSaving(true)

    try {
      if (isEdit) {
        await updateProject(projectDetail.id, {
          name: data.projectName,
          description: data.description,
          status: data.status.value
        })
      } else {
        const res = await createProject({
          name: data.projectName,
          description: data.description,
          type: data.projectType.value
        })

        history.push(`/projects/${res.value.id}/challenges`)
        setActiveProject(res.value.id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  // Build options for react-select from `types`
  const selectOptions = projectTypes.map((t) => ({
    value: t.key,
    label: t.displayName
  }))

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
          {isEdit && (
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
                      options={PROJECT_STATUS}
                      id='status'
                      {...field}
                      isClearable
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
                      options={selectOptions}
                      id='projectType'
                      {...field}
                      isClearable
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
        </div>
        <div className={styles.actionButtons}>
          <PrimaryButton
            text={isSaving ? 'Saving...' : 'Save'}
            type={'info'}
            submit
            disabled={isSaving}
          />
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
