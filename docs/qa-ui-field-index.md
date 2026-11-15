# QA frontend field reference index

Generated from the actual frontend AST by `bun run qa:coverage`. This is a broad index of field/property references and input metadata, not a claim that every reference is a database field. Read the domain map and limitations in `qa-field-coverage.md`.

### features/admissions/admission-checklist.tsx

Field references (includes local state): `admission`, `admission.assigned_to`, `admission.id`, `checkIn.error`, `checkIn.error.message`, `checkIn.isError`, `checkIn.isPending`, `checkIn.mutate`, `checklist.data`, `checklist.data?.some`, `checklist.isError`, `checklist.isLoading`, `checklist.refetch`, `children`, `detail`, `item.code`, `item.status`, `state`, `title`, `user.id`, `user?.job_role`, `user?.role`

Input/label metadata: aria-label=Admission progress

### features/admissions/admission-entry-gate.tsx

Field references (includes local state): `admission`, `admission.arrival_status`, `admission?.id`, `checklist.data`, `checklist.data?.some`, `checklist.isError`, `checklist.isLoading`, `checklist.refetch`, `children`, `item.code`, `item.status`

Input/label metadata: None

### features/admissions/admission-form.tsx

Field references (includes local state): `(beds.data ?? []).filter`, `(doctors.data ?? []).filter`, `(nurses.data ?? []).filter`, `(patients.data ?? []).map`, `Promise.all`, `acceptRequest.isPending`, `acceptRequest.mutateAsync`, `availableBeds.length`, `availableBeds.map`, `bed.id`, `bed.label`, `bed.ward_id`, `bed.ward_name`, `beds.data`, `beds.data?.find`, `beds.isError`, `beds.isPending`, `beds.refetch`, `consultants.length`, `consultants.map`, `createPatient.isPending`, `createPatient.mutateAsync`, `createRequest.isPending`, `createRequest.mutateAsync`, `created.id`, `diagnosis.trim`, `doctor.id`, `doctor.job_role`, `doctor.name`, `doctors.data`, `doctors.isError`, `doctors.isPending`, `doctors.refetch`, `duplicateCheck.isPending`, `duplicateCheck.mutateAsync`, `duplicates.length`, `duplicates.map`, `empty`, `err.message`, `error`, `event.preventDefault`, `event.target`, `event.target.value`, `label`, `loading`, `matches.length`, `name.trim`, `new Date().toISOString`, `new Date().toISOString().slice`, `nurse.id`, `nurse.job_role`, `nurse.name`, `nurses.data`, `nurses.isError`, `nurses.isPending`, `nurses.refetch`, `onCancel`, `onCreated`, `onRetry`, `patient.id`, `patient?.dob`, `patient?.name`, `patient?.uhid`, `patients.data`, `patients.data?.length`, `patients.isError`, `patients.isFetching`, `patients.refetch`, `phone.trim`, `queryClient.invalidateQueries`, `record.dob`, `record.id`, `record.name`, `record.phone`, `record.uhid`, `request.id`, `result.admission`, `result.admission.id`, `search.trim`, `search.trim().length`, `selectedBed?.ward_id`, `staffNurses.length`, `staffNurses.map`, `submissionPending.current`, `summary.trim`, `ward.id`, `wards.data`, `wards.data?.find`, `wards.data?.find(
    (ward) => ward.id === selectedBed?.ward_id
  )?.unit_id`, `wards.data?.find((ward) => ward.id === bed.ward_id)?.unit_id`, `wards.isError`, `wards.isPending`, `wards.refetch`

Input/label metadata: aria-label=Patient record; aria-label=Possible duplicate patient records; placeholder=Contact number; placeholder=Full name; placeholder=Name, phone or UHID; placeholder=Reason for admission, current condition and immediate care needs; placeholder=Working diagnosis

### features/admissions/admissions-board.tsx

Field references (includes local state): `admission.id`, `admissions`, `admissions.find`, `contentRef.current`, `contentRef.current?.querySelector`, `contentRef.current?.querySelector<HTMLElement>(heading)?.focus`, `onOpen`

Input/label metadata: None

### features/admissions/arrival-status.ts

Field references (includes local state): `admission.admitted_at`, `admission.arrival_status`, `admission.arrived_at`, `admission.assigned_to`, `checklist.some`, `checklist?.some`, `item.code`, `item.status`

Input/label metadata: None

### features/admissions/initial-assessment.tsx

Field references (includes local state): `admission`, `admission.bed`, `admission.id`, `admission.patient_name`, `admission.revision`, `admission.severity`, `admissionId`, `body`, `body.trim`, `create.error`, `create.error.message`, `create.isError`, `create.isPending`, `create.mutateAsync`, `currentUser()?.job_role`, `dialogRef.current`, `dialogRef.current.showModal`, `dialogRef.current?.open`, `dialogRef.current?.setAttribute`, `dialogRef.current?.showModal`, `draft.plan`, `draft.plan.trim`, `draft[key].trim`, `event.key`, `event.preventDefault`, `event.target`, `event.target.value`, `fields.find`, `fields.map`, `id`, `item.id`, `item.label`, `key`, `label`, `missing.label`, `missing.label.toLowerCase`, `note.draft_body`, `note.id`, `notes.data`, `notes.data?.length`, `notes.data?.map`, `setBody`, `sign.error`, `sign.error?.message`, `sign.isError`, `sign.isPending`, `sign.mutateAsync`, `tabs.find`, `tabs.find((item) => item.id === tab)?.label`, `tabs.map`, `update.error`, `update.error.message`, `update.isError`, `update.isPending`, `update.isSuccess`, `update.mutate`, `user.id`, `window.addEventListener`, `window.removeEventListener`

Input/label metadata: aria-label=Close initial assessment; aria-label=Initial assessment sections; key=chief_complaint; key=clinical_impression; key=examination; key=history; label=Assessment; label=Care plan; label=Chief complaint; label=Clinical impression; label=Clinical status; label=Current symptoms; label=Examination; label=Notes; label=Observations

### features/auth/session-welcome.tsx

Field references (includes local state): `(['morning', 'afternoon', 'night'] as const).map`, `busy`, `event.preventDefault`, `onContinue`, `onSignOut`, `user`, `user.job_role`, `user.name`, `user.role`

Input/label metadata: aria-label=Session setup; name=shift

### features/chat/chat-composer.tsx

Field references (includes local state): `Math.max`, `Math.min`, `Number.POSITIVE_INFINITY`, `active.current`, `candidates.data`, `candidates.data?.pages`, `candidates.data?.pages.flat`, `candidates.fetchNextPage`, `candidates.hasNextPage`, `candidates.isError`, `candidates.isFetchingNextPage`, `candidates.isPending`, `candidates.refetch`, `client.getQueryData`, `client.invalidateQueries`, `client.removeQueries`, `client.setQueryData`, `crypto.randomUUID`, `document
        .getElementById`, `document
        .getElementById(activeOption)
        ?.scrollIntoView`, `draft.files`, `draft.files.filter`, `draft.files.map`, `draft.mentions`, `draft.mentions.filter`, `draft.mentions.length`, `draft.mentions.map`, `draft.mentions.some`, `draft.revision`, `draft.sending`, `draft.text`, `draft.text.length`, `draft.text.length.toLocaleString`, `draft.text.slice`, `draft.text.split`, `draft.text.split('\n').length`, `draft.text.trim`, `draft.uploads`, `draft.uploads.filter`, `draft.uploads.map`, `error`, `event.ctrlKey`, `event.currentTarget`, `event.currentTarget.selectionStart`, `event.key`, `event.metaKey`, `event.nativeEvent`, `event.nativeEvent.isComposing`, `event.preventDefault`, `event.shiftKey`, `event.target`, `event.target.files`, `event.target.selectionStart`, `event.target.value`, `field.scrollHeight`, `field.scrollLeft`, `field.scrollTop`, `field.style`, `field.style.height`, `field.style.overflowY`, `file`, `file.name`, `files`, `files.filter`, `files.map`, `files.map(fileProblem).filter`, `id`, `input.current`, `input.current?.click`, `inserted.length`, `item.error`, `item.id`, `localStorage.getItem`, `m.id`, `m.name`, `mentions`, `message`, `message.body`, `message.id`, `message.mentions`, `message.revision`, `message?.body`, `message?.id`, `message?.mentions`, `message?.revision`, `messageId`, `node.clientHeight`, `node.scrollHeight`, `node.scrollTop`, `old.uploads`, `old.uploads.filter`, `old.uploads.map`, `onDone`, `patientId`, `result.id`, `revision`, `selected.id`, `sending`, `sending.current`, `text`, `text.length`, `textarea.current`, `textarea.current?.focus`, `textarea.current?.setSelectionRange`, `token.end`, `token.search`, `token.start`, `token?.search`, `upload.error`, `upload.file`, `upload.file.name`, `upload.id`, `upload.messageId`, `uploads`, `uploads.filter`, `user.id`, `user.job_role`, `user.job_role?.replaceAll`, `user.name`, `user.name.slice`, `userId`, `users.length`, `users.map`, `window.addEventListener`, `window.removeEventListener`

Input/label metadata: aria-label=Attach chat files; aria-label=Attach files; aria-label=Staff to tag; aria-label=Tagged colleagues; placeholder=Message…

### features/chat/chat-image-gestures.ts

Field references (includes local state): `Math.hypot`, `Math.max`, `Math.min`, `a.x`, `a.y`, `b.x`, `b.y`, `distance`, `event.clientX`, `event.clientY`, `event.currentTarget`, `event.currentTarget.hasPointerCapture`, `event.currentTarget.releasePointerCapture`, `event.currentTarget.setPointerCapture`, `event.pointerId`, `event.pointerType`, `event.preventDefault`, `fingers.current`, `fingers.current.delete`, `fingers.current.get`, `fingers.current.set`, `fingers.current.size`, `fingers.current.values`, `height`, `imageX`, `imageY`, `minimum`, `node.clientHeight`, `node.clientWidth`, `node.getBoundingClientRect`, `node.scrollLeft`, `node.scrollTop`, `old.x`, `old.y`, `onEnd`, `onPinch`, `pinch.current`, `rect.left`, `rect.top`, `scale`, `start.distance`, `start.imageX`, `start.imageY`, `start.scale`, `viewportX`, `viewportY`, `width`, `x`, `y`

Input/label metadata: None

### features/chat/chat-image-preview.tsx

Field references (includes local state): `IMAGE_TYPES.has`, `URL.createObjectURL`, `URL.revokeObjectURL`, `attachment`, `attachment.content_type`, `attachment.filename`, `attachment.id`, `blob.type`, `container.current`, `container.current?.closest`, `controller.abort`, `controller.signal`, `controller.signal.aborted`, `downloadError`, `downloading`, `entries.some`, `entry.isIntersecting`, `event.detail`, `localStorage.getItem`, `observer.observe`, `observer?.disconnect`, `onDownload`, `patientId`, `pointerOpen.current`

Input/label metadata: None

### features/chat/chat-image-zoom.tsx

Field references (includes local state): `Math.max`, `Math.min`, `Math.round`, `STEPS.find`, `STEPS.findLast`, `event.currentTarget`, `event.currentTarget.naturalHeight`, `event.currentTarget.naturalWidth`, `filename`, `frame`, `frame.height`, `frame.width`, `height`, `image.height`, `image.width`, `node.clientHeight`, `node.clientWidth`, `node.scrollLeft`, `node.scrollTop`, `observer?.disconnect`, `observer?.observe`, `old.frame`, `old.frame.height`, `old.frame.width`, `old.height`, `old.width`, `pinchAnchor?.imageX`, `pinchAnchor?.imageY`, `pinchAnchor?.viewportX`, `pinchAnchor?.viewportY`, `previous.current`, `src`, `viewport.current`, `viewport.height`, `viewport.width`, `width`, `window.addEventListener`, `window.removeEventListener`

Input/label metadata: aria-label=Image viewing area; aria-label=Image zoom; aria-label=Zoom in; aria-label=Zoom out

### features/chat/chat-message-body.tsx

Field references (includes local state): `content.push`, `message`, `message.body`, `message.body.slice`, `message.mentions`, `message.mentions.filter`, `person.id`, `person.name`, `range.end`, `range.id`, `range.start`, `ranges.flatMap`, `ranges.some`, `remaining.length`, `remaining.map`

Input/label metadata: aria-label=Tagged staff

### features/chat/chat-model.ts

Field references (includes local state): `CHAT_FILE_ACCEPT.split`, `CHAT_FILE_ACCEPT.split(',').includes`, `Date.now`, `Date.parse`, `MENTION.exec`, `UUID.test`, `[...unique.values()].sort`, `a.created_at`, `a.end`, `a.id`, `a.start`, `b.created_at`, `b.end`, `b.id`, `b.start`, `end`, `error.message`, `error.status`, `file.size`, `file.type`, `id`, `match.index`, `match.start`, `match[1].length`, `match[2].length`, `matches.push`, `matches.sort`, `mentionRanges(text, [{ id: '', name }]).length`, `message.author_id`, `message.created_at`, `message.id`, `pages.flat`, `person.id`, `person.name`, `person.name.replace`, `prefix.lastIndexOf`, `ranges.at`, `ranges.at(-1)?.end`, `ranges.push`, `search`, `start`, `text.matchAll`, `text.slice`, `unique.has`, `unique.set`, `unique.values`, `value.message_id`, `value.patient_id`

Input/label metadata: None

### features/chat/patient-chat.tsx

Field references (includes local state): `(attachment.byte_size / 1024).toFixed`, `Date.now`, `Intl.DateTimeFormat`, `URL.createObjectURL`, `URL.revokeObjectURL`, `anchors.current`, `anchors.current.delete`, `anchors.current.get`, `anchors.current.set`, `attachment`, `attachment.byte_size`, `attachment.content_type`, `attachment.filename`, `attachment.id`, `chat.data`, `chat.data?.pages`, `chat.error`, `chat.fetchNextPage`, `chat.hasNextPage`, `chat.isError`, `chat.isFetching`, `chat.isFetchingNextPage`, `chat.isPending`, `chat.refetch`, `controller.current`, `controller.current?.abort`, `document.body`, `document.body.append`, `document.createElement`, `editMessage.id`, `element.focus`, `element.scrollIntoView`, `event.currentTarget`, `history.data`, `history.data.length`, `history.data?.map`, `history.error`, `history.isError`, `history.isPending`, `history.refetch`, `initial.current`, `link.click`, `link.download`, `link.href`, `link.remove`, `list.current`, `list.current.scrollHeight`, `list.current.scrollTop`, `list.current?.scrollHeight`, `localStorage.getItem`, `m.id`, `message`, `message.attachments`, `message.attachments.map`, `message.author_id`, `message.author_name`, `message.author_name.slice`, `message.created_at`, `message.edited_at`, `message.id`, `message.revision`, `messageId`, `messages.find`, `messages.length`, `messages.map`, `messages.some`, `name`, `new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format`, `node.clientHeight`, `node.scrollHeight`, `node.scrollTop`, `olderHeight.current`, `onBack`, `onClose`, `onOpen`, `onOpenPatient`, `patient.data`, `patient.data?.name`, `patient.error`, `patient.isError`, `patient.isPending`, `patient.refetch`, `patientId`, `patientName`, `previousCount.current`, `request.signal`, `request.signal.aborted`, `revision.body`, `revision.mention_ids`, `revision.mention_ids.length`, `revision.revision`, `revision.superseded_at`, `target.current`, `user?.id`, `userId`

Input/label metadata: aria-label=Patient conversation

### features/documents/clinical-document.ts

Field references (includes local state): `Promise.resolve`, `admissionId`, `author`, `body`, `data.author`, `data.author.designation`, `data.author.name`, `data.author.registration_number`, `data.body`, `data.draft`, `data.patient`, `data.patient.admissionId`, `data.patient.name`, `data.patient.uhid`, `data.savedAt`, `data.title`, `designation`, `doc.body`, `doc.body.append`, `doc.createElement`, `doc.head`, `doc.head.append`, `doc.title`, `draft`, `header.append`, `hospitalBranding.address`, `hospitalBranding.contact`, `hospitalBranding.logo`, `hospitalBranding.name`, `logo.alt`, `logo.referrerPolicy`, `logo.src`, `logo?.decode`, `logo?.decode().catch`, `name`, `new Date().toLocaleString`, `new Date(data.savedAt).toLocaleString`, `node.textContent`, `parent.append`, `patient`, `popup.document`, `popup.focus`, `popup.opener`, `popup.print`, `ready.then`, `registration_number`, `savedAt`, `style.textContent`, `text(doc.body, 'div', data.body).className`, `title`, `uhid`, `window.open`

Input/label metadata: None

### features/documents/document-actions.tsx

Field references (includes local state): `cause.message`, `document`, `document.draft`, `label`

Input/label metadata: None

### features/forms/form-version-editor.tsx

Field references (includes local state): `JSON.stringify`, `['choice', 'select', 'radio', 'yes_no'].includes`, `['long_text', 'textarea'].includes`, `['number', 'date'].includes`, `autofill`, `body`, `capture.key`, `capture.label`, `capture.signer_role`, `client.invalidateQueries`, `currentUser()?.name`, `data.get`, `event.currentTarget`, `event.preventDefault`, `event.target`, `event.target.value`, `field.key`, `field.label`, `field.options`, `field.options?.map`, `field.required`, `field.signer_role`, `field.type`, `field_key`, `fields`, `form_values`, `id`, `item.field_key`, `item.type`, `key`, `label`, `lock.current`, `method`, `mutation.error`, `mutation.error.message`, `mutation.isPending`, `mutation.mutate`, `mutation.reset`, `new Date(signed.signed_at).toLocaleString`, `options`, `path`, `props.version`, `props.version.id`, `required`, `revision`, `role`, `signatureFields.map`, `signatures`, `signatures.find`, `signed.role`, `signed.signed_at`, `signed.signer_name`, `signed.strokes`, `signed.strokes?.length`, `signed_at`, `signer.trim`, `signer_name`, `signer_role`, `status`, `strokes`, `type`, `updated.form_values`, `updated.revision`, `variables.method`, `variables.path`, `version`, `version.fields`, `version.fields
              .filter`, `version.fields
              .filter((field) => field.type !== 'signature')
              .map`, `version.fields
            .filter`, `version.fields
            .filter((field) => field.type !== 'signature')
            .map`, `version.fields.filter`, `version.form_values`, `version.id`, `version.revision`, `version.status`, `version.version`, `window.confirm`

Input/label metadata: None

### features/forms/hospital-templates.ts

Field references (includes local state): `source`

Input/label metadata: key=doctor_signature; key=patient_name; key=patient_signature; key=uhid; label=Doctor signature; label=Patient name; label=Patient signature; label=UHID; name=Anaesthesia consent; name=Blood transfusion consent; name=Discharge against medical advice; name=General treatment consent; name=Patient transfer record; name=Procedure consent

### features/forms/patient-forms.tsx

Field references (includes local state): `JSON.stringify`, `['consultant', 'duty_doctor'].includes`, `admissionId`, `client.invalidateQueries`, `create.error`, `create.error.message`, `create.isPending`, `create.mutate`, `createLock.current`, `created_at`, `currentUser()?.job_role`, `detail.data`, `detail.data.signatures`, `detail.data.version`, `detail.data.version.id`, `detail.data.version.status`, `detail.data.version.version`, `detail.isError`, `detail.isLoading`, `detail.refetch`, `event.target`, `event.target.value`, `field_key`, `fields`, `form_values`, `id`, `instance.created_at`, `instance.id`, `instance.template_id`, `instances.data`, `instances.data?.length`, `instances.data?.map`, `instances.isError`, `instances.isLoading`, `instances.refetch`, `key`, `label`, `name`, `new Date(instance.created_at).toLocaleString`, `onCreated`, `options`, `patientId`, `required`, `revision`, `role`, `signatures`, `signed_at`, `signer_name`, `signer_role`, `status`, `strokes`, `synthetic`, `template.id`, `template.name`, `template_id`, `templates.data`, `templates.data?.find`, `templates.data?.find(
              (template) => template.id === instance.template_id
            )?.name`, `templates.data?.map`, `templates.isError`, `templates.isLoading`, `templates.refetch`, `type`, `version`, `version.id`, `version.status`, `version.version`, `versions.data`, `versions.data?.map`, `versions.isError`, `versions.isLoading`, `versions.refetch`

Input/label metadata: aria-label=Form template

### features/forms/signature-pad.tsx

Field references (includes local state): `Math.max`, `Math.min`, `current.current`, `cursor.current`, `disabled`, `event.clientX`, `event.clientY`, `event.currentTarget`, `event.currentTarget.focus`, `event.currentTarget.getBoundingClientRect`, `event.currentTarget.setPointerCapture`, `event.key`, `event.pointerId`, `event.preventDefault`, `onChange`, `pointer.current`, `previous.at`, `previous.at(-1)?.length`, `previous.length`, `previous.slice`, `r.height`, `r.left`, `r.top`, `r.width`, `stroke.length`, `stroke.map`, `stroke.map(([x, y]) => ${x * 1000},${y * 500}).join`, `stroke.some`, `stroke[0]?.join`, `strokes`, `strokes.every`, `strokes.length`, `strokes.map`, `strokes.reduce`, `strokes.some`, `value`, `value.length`, `value.slice`

Input/label metadata: aria-label=Handwritten signature; aria-label=Signature drawing pad

### features/forms/template-builder.tsx

Field references (includes local state): `JSON.stringify`, `[
                      'name',
                      'uhid',
                      'phone',
                      'address',
                      'blood_group',
                      'abha_id',
                    ].map`, `[
                    ['text', 'Short text'],
                    ['long_text', 'Long text'],
                    ['number', 'Number'],
                    ['yes_no', 'Yes / no'],
                    ['choice', 'Choice'],
                    ['signature', 'Signature'],
                  ].map`, `['patient', 'doctor', 'consultant', 'witness'].map`, `category.trim`, `client.invalidateQueries`, `create.error`, `create.error.message`, `create.isPending`, `create.mutate`, `crypto.randomUUID`, `crypto.randomUUID().replaceAll`, `event.preventDefault`, `event.target`, `event.target.checked`, `event.target.value`, `event.target.value
                          .split`, `event.target.value
                          .split(',')
                          .map`, `field.key`, `field.label`, `field.options`, `field.options?.join`, `field.required`, `field.signer_role`, `field.source`, `field.type`, `fields.length`, `fields.map`, `hospitalStarters.map`, `id`, `lock.current`, `name.trim`, `onCancel`, `onCreated`, `previous.filter`, `previous.map`, `role.slice`, `role[0].toUpperCase`, `row.id`, `starter.category`, `starter.fields`, `starter.name`, `value.trim`

Input/label metadata: aria-label=Start from; label=New field; name=Patient name

### features/handover/action-tasks.tsx

Field references (includes local state): `(['DD', 'Nurse', 'Consultant'] as const).map`, `(['Shift End', 'Now', 'Next Shift'] as const).map`, `Object.entries`, `Object.entries(checklists).map`, `admissionId`, `chips.map`, `crypto.randomUUID`, `done`, `entry.done`, `entry.id`, `event.key`, `event.preventDefault`, `event.target`, `event.target.checked`, `event.target.value`, `high_priority`, `id`, `line.replace`, `line.replace(checkboxPrefix, '').trim`, `line.startsWith`, `line.trim`, `next.length`, `next.push`, `next.some`, `onChange`, `orderTask.id`, `orderTask.text`, `patientLabel`, `role`, `selected.filter`, `selected.includes`, `selectedTasks.length`, `task.done`, `task.high_priority`, `task.id`, `task.role`, `task.text`, `task.timing`, `tasks`, `tasks
        .map`, `tasks
        .map(
          (task) =>
            ${task.done ? '☑' : '☐'} ${task.high_priority ? '[HIGH] ' : ''}${task.text} · ${task.role} · ${task.timing}
        )
        .join`, `tasks.filter`, `tasks.filter((task) => task.done).length`, `tasks.length`, `tasks.map`, `text`, `text
    .split`, `text
    .split('\n')
    .filter`, `text
    .split('\n')
    .filter((line) => line.trim())
    .map`, `text.trim`, `timing`

Input/label metadata: aria-label=Draft handover actions; aria-label=Handover action checklist; aria-label=New handover action; aria-label=Select all handover tasks; aria-label=Task role; aria-label=Task timing; placeholder=Type clinical task and hit Enter (e.g., Check 2h ABG)...

### features/handover/conflict.ts

Field references (includes local state): `error.message`, `error.message.toLowerCase`, `error.message.toLowerCase().includes`, `error.status`

Input/label metadata: None

### features/handover/events.ts

Field references (includes local state): `Promise.all`, `[
      ['structured-handover'],
      ['handover-questions'],
      ['admissions'],
      ['notifications'],
      ['worklist'],
      ['ward-summary'],
      ['unit-census'],
      ['census-cards'],
    ].map`, `client.invalidateQueries`, `type.startsWith`

Input/label metadata: None

### features/handover/list.tsx

Field references (includes local state): `(result as Detail).session`, `(result as Detail).session.id`, `(result as Session).id`, `['draft', 'sent'].includes`, `data`, `direction`, `doctor`, `event.preventDefault`, `event.target`, `event.target.value`, `existingOutgoing`, `existingOutgoing.id`, `filteredSessions`, `filteredSessions?.length`, `filteredSessions?.map`, `handoverConflict`, `mutation`, `mutation.isPending`, `mutation.mutate`, `mutation.reset`, `new Date(session.created_at).toLocaleString`, `open.id`, `person.id`, `person.name`, `refreshed.data`, `refreshed.data?.find`, `session.created_at`, `session.id`, `session.outgoing_doctor_id`, `session.outgoing_nurse_id`, `session.status`, `session.ward`, `sessions`, `sessions.isError`, `sessions.refetch`, `setSelected`, `user`, `user?.id`, `user?.role`, `users`, `users.data`, `users.data
                    ?.filter`, `users.data
                    ?.filter((person) => person.id !== user?.id)
                    .map`, `users.data?.find`, `users.data?.find(
                  (person) => person.id === session.outgoing_doctor_id
                )?.name`, `ward.trim`

Input/label metadata: placeholder=All wards

### features/handover/patient.tsx

Field references (includes local state): `(['stable', 'watcher', 'unstable'] as const).map`, `(event.target as HTMLElement).tagName`, `JSON.stringify`, `Object.fromEntries`, `Promise.all`, `[
                              summaryRef.current.value,
                              chip,
                            ]
                              .filter`, `[
                              summaryRef.current.value,
                              chip,
                            ]
                              .filter(Boolean)
                              .join`, `['Post-op Day 1', 'Extubated', 'Sepsis protocol'].map`, `accepted_at`, `action_list`, `action_tasks`, `active`, `admission_id`, `admitted_at`, `age`, `arrival_status`, `base`, `baseline.current`, `baseline.current.chartRevision`, `baseline.current.itemRevision`, `baseline.current.severity`, `bed`, `body`, `body.trim`, `busy`, `chart.data`, `chart.data.admission`, `chart.data.admission.arrival_status`, `chart.data.admission.bed`, `chart.data.admission.patient_name`, `chart.data.admission.revision`, `chart.data.admission.severity`, `chart.data.admission.ward`, `chart.data.header`, `chart.data.header.news2`, `chart.data.header.news2.escalation`, `chart.data.header.news2.recorded_at`, `chart.data.header.news2.score`, `chart.isError`, `chart.isLoading`, `checks.map`, `client.invalidateQueries`, `consultant_name`, `contingency`, `created_at`, `data.get`, `dirty`, `doctor`, `draft`, `e.currentTarget`, `e.preventDefault`, `error.status`, `escalation`, `event.currentTarget`, `event.preventDefault`, `event.target`, `event.target.checked`, `event.target.value`, `f.get`, `handover_notes`, `id`, `incoming_doctor_id`, `incoming_nurse_id`, `item`, `item.accepted_at`, `item.action_list`, `item.action_tasks`, `item.admission_id`, `item.admitted_at`, `item.age`, `item.arrival_status`, `item.bed`, `item.contingency`, `item.handover_notes`, `item.id`, `item.item_revision`, `item.patient_name`, `item.patient_summary`, `item.receiver_view`, `item.reviewed_by`, `item.severity`, `item.sex`, `item.snapshot_revision`, `item.stale_acknowledged`, `item.status`, `item.uhid`, `item.ward`, `itemId`, `item_revision`, `items`, `key.replaceAll`, `method`, `mutation`, `mutation.isPending`, `mutation.mutate`, `new Date(chart.data.header.news2.recorded_at).toLocaleString`, `new Date(item.accepted_at).toLocaleString`, `new Date(item.admitted_at).toLocaleDateString`, `new Date(question.created_at).toLocaleString`, `news2`, `news2_score`, `onDirtyChange`, `onPrevious`, `outgoing`, `outgoing_doctor_id`, `outgoing_nurse_id`, `path`, `patient`, `patient?.age`, `patient?.sex`, `patient?.uhid`, `patient_name`, `patient_summary`, `query.data`, `query.data?.map`, `query.isError`, `question.body`, `question.created_at`, `question.id`, `readback.trim`, `receiverView.trim`, `receiver_view`, `recorded_at`, `response.trim`, `result?.item_revision`, `result?.severity`, `result?.snapshot_revision`, `reviewed_by`, `risk.trim`, `rows.map`, `score`, `send.isPending`, `send.mutate`, `senderName`, `senderName?.toUpperCase`, `session`, `session.id`, `session.status`, `sessionId`, `severity`, `severityStyles[level].dot`, `severityStyles[level].selected`, `sex`, `snapshot_revision`, `splitContingency(item.contingency).response`, `splitContingency(item.contingency).risk`, `stale_acknowledged`, `status`, `submit`, `summary.data`, `summary.data?.bed`, `summary.data?.bed?.ward`, `summary.data?.patient`, `summaryRef.current`, `summaryRef.current.value`, `uhid`, `value?.match`, `ward`

Input/label metadata: aria-label=Chart illness severity; aria-label=Confirm updated chart reviewed; name=contingency; name=discrepancies; name=notes; name=summary; placeholder=Ask a handover question; placeholder=Enter clinical summary, diagnosis, events during shift...; placeholder=Handover notes; placeholder=Say back the plan in your own words; placeholder=What could change?; placeholder=What should the receiving team do?; placeholder=Your findings, concerns and plan

### features/handover/session.tsx

Field references (includes local state): `(['all', 'unstable', 'watcher', 'draft', 'ready'] as const).map`, `Math.max`, `['draft', 'sent'].includes`, `${item.patient_name} ${item.uhid ?? ''} ${item.ward ?? ''} ${item.bed ?? ''}
        .toLowerCase`, `${item.patient_name} ${item.uhid ?? ''} ${item.ward ?? ''} ${item.bed ?? ''}
        .toLowerCase()
        .includes`, `activeId`, `activeItem.id`, `activeItem?.id`, `base`, `completedStatus`, `detail`, `detail.data`, `detail.data.items`, `detail.data.items.filter`, `detail.data.items.filter(
                        (item) => item.status === progressStatus
                      ).length`, `detail.data.items.filter((item) => item.status === progressStatus).length`, `detail.data.items.length`, `detail.data.items.map`, `detail.data.session`, `detail.data.session.status`, `detail.data?.items`, `detail.data?.items.find`, `detail.data?.session`, `detail.data?.session.status`, `detail.isError`, `detail.items`, `detail.items.some`, `detail.refetch`, `detail.session`, `detail.session.status`, `dirty`, `disabled`, `doctor`, `event.target`, `event.target.checked`, `event.target.value`, `item`, `item.action_tasks`, `item.action_tasks.filter`, `item.action_tasks.filter((task) => !task.done).length`, `item.action_tasks?.some`, `item.age`, `item.arrival_status`, `item.bed`, `item.consultant_name`, `item.id`, `item.news2_score`, `item.patient_name`, `item.severity`, `item.sex`, `item.sex?.charAt`, `item.sex?.charAt(0).toUpperCase`, `item.status`, `item.uhid`, `item.ward`, `items`, `items.filter`, `items.findIndex`, `items[Math.max(0, index - 1)].id`, `layout.content`, `layout.footer`, `layout.workspace`, `mutation`, `mutation.isPending`, `mutation.mutate`, `onBack`, `onDirtyChange`, `onSelect`, `outgoing`, `search.trim`, `search.trim().toLowerCase`, `selected`, `senderName`, `task.done`, `visible.length`, `visible.map`, `window.confirm`

Input/label metadata: aria-label=Filter by severity; aria-label=Handover patients; aria-label=Reviewed; aria-label=Search handover patients; placeholder=Search patient, ward or bed

### features/handover/structured-handover.tsx

Field references (includes local state): `JSON.stringify`, `Math.max`, `['draft', 'sent'].includes`, `['sent', 'completed'].includes`, `body`, `candidate.id`, `changeDirection`, `completed`, `detail.data`, `detail.data.session`, `detail.data.session.outgoing_doctor_id`, `detail.data.session.outgoing_nurse_id`, `detail.data?.items`, `detail.data?.items.filter`, `detail.data?.items.filter(
              (item) => item.status === (outgoing ? 'signed' : 'accepted')
            ).length`, `detail.data?.items.length`, `detail.session`, `detail.session.outgoing_doctor_id`, `detail.session.outgoing_nurse_id`, `direction`, `doctor`, `event.preventDefault`, `event.returnValue`, `item.status`, `method`, `mutation.error`, `mutation.error.message`, `mutation.isError`, `mutation.variables`, `mutation.variables?.path`, `onBack`, `onDirtyChange`, `path`, `selected`, `session.incoming_nurse_id`, `session.outgoing_doctor_id`, `session.outgoing_nurse_id`, `session.status`, `sessions.data`, `sessions?.filter`, `sessions?.find`, `total`, `user?.id`, `user?.job_role`, `user?.role`, `users.data`, `users?.find`, `users?.find((candidate) => candidate.id === senderId)?.name`, `window.addEventListener`, `window.confirm`, `window.removeEventListener`

Input/label metadata: aria-label=Handover progress

### features/home/patient-order.ts

Field references (includes local state): `Date.parse`, `Number.isFinite`, `a.admission`, `a.admission?.admitted_at`, `a.census`, `a.census.label`, `a.census.patient_name`, `a.census.severity`, `a.details`, `a.details?.scores`, `a.localeCompare`, `admission`, `admitted_at`, `b.admission`, `b.admission?.admitted_at`, `b.census`, `b.census.label`, `b.census.patient_name`, `b.census.severity`, `b.details`, `b.details?.scores`, `census`, `details`, `label`, `patient_name`, `scores`, `severity`

Input/label metadata: None

### features/home/patient-tile.tsx

Field references (includes local state): `Number.isFinite`, `admission`, `admission.arrival_status`, `admission?.admitted_at`, `admission?.bed`, `admission?.ward`, `canOrder`, `census`, `census.admission_id`, `census.admission_id.slice`, `census.label`, `census.patient_name`, `census.severity`, `census.ward_name`, `details`, `details.dob`, `details.open_alerts`, `details.sex`, `details?.diagnosis`, `details?.dob`, `details?.doctor_name`, `details?.open_alerts`, `details?.scores`, `details?.sex`, `dob.getDate`, `dob.getFullYear`, `dob.getMonth`, `new Date(admitted).toLocaleDateString`, `now.getDate`, `now.getFullYear`, `now.getMonth`, `onOpen`, `options.filter`, `patient`, `patientDestinations.overview`, `shortcut.id`, `shortcuts`, `shortcuts
          .flatMap`, `shortcuts
          .flatMap((id) => options.filter((shortcut) => shortcut.id === id))
          .map`, `values.join`, `values.push`

Input/label metadata: None

### features/investigations/investigation-model.ts

Field references (includes local state): `(Array.isArray(raw.values) ? raw.values : []).flatMap`, `Array.isArray`, `Date.parse`, `Math.max`, `Number.isFinite`, `[
    item.title,
    item.status,
    item.category,
    item.order.priority,
    item.report?.summary,
    item.report?.body,
    item.report?.author,
    ...(item.report?.values.map(
      (value) => ${value.name} ${value.value} ${value.unit} ${value.flag}
    ) ?? []),
  ]
    .join`, `[
    item.title,
    item.status,
    item.category,
    item.order.priority,
    item.report?.summary,
    item.report?.body,
    item.report?.author,
    ...(item.report?.values.map(
      (value) => ${value.name} ${value.value} ${value.unit} ${value.flag}
    ) ?? []),
  ]
    .join(' ')
    .toLowerCase`, `['investigation', 'laboratory', 'imaging'].includes`, `a.order`, `a.order.created_at`, `a.order.priority`, `author`, `b.order`, `b.order.created_at`, `b.order.priority`, `body`, `category`, `delayReason`, `delay_reason`, `eta`, `eta_at`, `flag`, `haystack.includes`, `inactive`, `issuedAt`, `issued_at`, `item.category`, `item.inactive`, `item.order`, `item.order.priority`, `item.report`, `item.report?.author`, `item.report?.body`, `item.report?.summary`, `item.report?.values`, `item.report?.values.map`, `item.stage`, `item.status`, `item.title`, `name`, `order`, `order.approval_status`, `order.id`, `order.kind`, `order.payload`, `order.payload.imaging`, `order.payload.name`, `order.payload.procedure`, `order.payload.test`, `order.status`, `orders
    .flatMap`, `orders
    .flatMap((order) => {
      const item = investigationFromOrder(order, updates[order.id]);
      return item ? [item] : [];
    })
    .sort`, `query
    .toLowerCase`, `query
    .toLowerCase()
    .trim`, `query
    .toLowerCase()
    .trim()
    .split`, `query
    .toLowerCase()
    .trim()
    .split(WORDS)
    .every`, `raw.author`, `raw.body`, `raw.issued_at`, `raw.status`, `raw.summary`, `raw.values`, `referenceRange`, `reference_range`, `report`, `report?.status`, `row.flag`, `row.name`, `row.reference_range`, `row.unit`, `row.value`, `stage`, `stageKeys.indexOf`, `stages`, `status`, `summary`, `title`, `tracking.delay_reason`, `tracking.eta_at`, `tracking.report`, `tracking.stage`, `tracking.updated_at`, `unit`, `updatedAt`, `updated_at`, `value`, `value.flag`, `value.name`, `value.trim`, `value.unit`, `value.value`, `values`, `values.length`

Input/label metadata: None

### features/investigations/investigations.tsx

Field references (includes local state): `Date.now`, `Date.parse`, `Number.isFinite`, `[
    item.title,
    Status: ${item.status},
    report?.summary,
    report?.body,
    ...(report?.values?.map(
      (value) =>
        ${value.name}: ${value.value}${value.unit ?  ${value.unit} : ''}${value.referenceRange ?  (reference: ${value.referenceRange}) : ''}${value.flag ?  · ${value.flag} : ''}
    ) ?? []),
    report
      ? ''
      : 'Report not received. This is an order/status record, not a diagnostic report.',
  ]
    .filter`, `[
    item.title,
    Status: ${item.status},
    report?.summary,
    report?.body,
    ...(report?.values?.map(
      (value) =>
        ${value.name}: ${value.value}${value.unit ?  ${value.unit} : ''}${value.referenceRange ?  (reference: ${value.referenceRange}) : ''}${value.flag ?  · ${value.flag} : ''}
    ) ?? []),
    report
      ? ''
      : 'Report not received. This is an order/status record, not a diagnostic report.',
  ]
    .filter(Boolean)
    .join`, `[report.issuedAt && when(report.issuedAt), report.author]
    .filter`, `[report.issuedAt && when(report.issuedAt), report.author]
    .filter(Boolean)
    .join`, `[requested, updated].filter`, `[requested, updated].filter(Boolean).join`, `admissionId`, `all.filter`, `category`, `category.toLowerCase`, `compact`, `event.target`, `event.target.value`, `filtered.length`, `filtered.slice`, `investigationsFromOrders(orders.data ?? [], updates).filter`, `item`, `item.category`, `item.delayReason`, `item.eta`, `item.inactive`, `item.order`, `item.order.created_at`, `item.order.id`, `item.order.priority`, `item.report`, `item.report.status`, `item.report?.issuedAt`, `item.stage`, `item.stages`, `item.stages.map`, `item.status`, `item.title`, `item.updatedAt`, `new Date(value).toLocaleString`, `onOpenReports`, `orders.data`, `orders.isError`, `orders.isLoading`, `orders.refetch`, `patient`, `report`, `report.author`, `report.body`, `report.issuedAt`, `report.status`, `report.summary`, `report.values`, `report.values.length`, `report.values.map`, `report?.body`, `report?.summary`, `report?.values`, `report?.values?.map`, `search`, `search.trim`, `state.className`, `state.text`, `title.toLowerCase`, `updates`, `value.flag`, `value.name`, `value.referenceRange`, `value.unit`, `value.value`, `visible.length`, `visible.map`

Input/label metadata: aria-label=Report values; name=Not available; placeholder=Search tests, reports or results…

### features/investigations/reports.tsx

Field references (includes local state): `(['lab', 'radiology'] as const).map`, `admissionId`, `initialCategory`, `patientName`, `uhid`

Input/label metadata: aria-label=Report sections; aria-label=Reports

### features/layout/layout-preferences.ts

Field references (includes local state): `Array.isArray`, `JSON.parse`, `JSON.stringify`, `defaultShortcuts.includes`, `localStorage.getItem`, `localStorage.setItem`, `valid.length`, `value.filter`, `value.length`, `window.addEventListener`, `window.dispatchEvent`, `window.removeEventListener`

Input/label metadata: None

### features/layout/layout-settings.tsx

Field references (includes local state): `currentUser()?.role`, `item.id`, `next.indexOf`, `next.length`, `onClose`, `option.id`, `options
      .map`, `options
      .map((option) => option.id)
      .filter`, `options.find`, `options.some`, `rows.map`, `savedShortcuts.filter`, `shortcuts.filter`, `shortcuts.includes`, `shortcuts.indexOf`, `shortcuts.length`, `userId`

Input/label metadata: aria-label=Close layout settings

### features/layout/patient-shortcuts.ts

Field references (includes local state): `patientDestinations.care`, `patientDestinations.chat`, `patientDestinations.labReports`, `patientDestinations.medications`, `patientDestinations.notes`, `patientDestinations.radiologyReports`, `patientShortcuts
    .filter`, `patientShortcuts
    .filter((shortcut) =>
      canOrder
        ? shortcut.id !== 'care'
        : shortcut.destination.section !== 'orders'
    )
    .map`, `patientShortcuts.map`, `shortcut.destination`, `shortcut.destination.section`, `shortcut.id`, `shortcut.label`

Input/label metadata: label=Clinical notes; label=Lab reports; label=Medication orders; label=Nursing care; label=Radiology reports; label=Team chat

### features/notes/doctor-progress-notes.tsx

Field references (includes local state): `JSON.stringify`, `Promise.all`, `[
    note.draft_body ?? '',
    context?.provisional_diagnoses.length
      ? Provisional diagnosis\n${context.provisional_diagnoses.join('\n')}
      : '',
    context?.observation_frequency
      ? Observation frequency\n${context.observation_frequency}\nClinical reason\n${context.observation_reason}
      : '',
  ]
    .filter`, `[
    note.draft_body ?? '',
    context?.provisional_diagnoses.length
      ? Provisional diagnosis\n${context.provisional_diagnoses.join('\n')}
      : '',
    context?.observation_frequency
      ? Observation frequency\n${context.observation_frequency}\nClinical reason\n${context.observation_reason}
      : '',
  ]
    .filter(Boolean)
    .join`, `active.current`, `admissionId`, `apiFetch<Vitals[]>(/admissions/${admissionId}/vitals?limit=1).then`, `body`, `body.trim`, `cause.message`, `client.invalidateQueries`, `context`, `context.observation_frequency`, `context.observation_reason`, `context.provisional_diagnoses`, `context.provisional_diagnoses.join`, `context?.observation_frequency`, `context?.provisional_diagnoses`, `context?.provisional_diagnoses.length`, `draft.frequency`, `draft.frequency.trim`, `draft.provisional`, `draft.provisional
      .split`, `draft.provisional
      .split('\n')
      .map`, `draft.provisional
      .split('\n')
      .map((text) => text.trim())
      .filter`, `draft.reason`, `draft.reason.trim`, `editing`, `editing.created_at`, `editing.id`, `editing.revision`, `editing.updated_at`, `event.preventDefault`, `event.target`, `event.target.value`, `frequency`, `localStorage.getItem`, `localStorage.setItem`, `lock.current`, `new Date(
                    note.saved_at ?? note.updated_at ?? note.created_at
                  ).toLocaleString`, `new Date().toISOString`, `new Date(editing.updated_at ?? editing.created_at).toLocaleString`, `note.author_stamp`, `note.author_stamp.designation`, `note.author_stamp.name`, `note.author_stamp.registration_number`, `note.clinical_context`, `note.clinical_context?.observation_frequency`, `note.clinical_context?.observation_reason`, `note.clinical_context?.provisional_diagnoses`, `note.clinical_context?.provisional_diagnoses.join`, `note.created_at`, `note.documentation_status`, `note.draft_body`, `note.id`, `note.kind`, `note.saved_at`, `note.updated_at`, `notes.data`, `notes.data?.map`, `notes.isError`, `notes.isPending`, `notes.isSuccess`, `notes.refetch`, `onChange`, `patientId`, `patientName`, `profile.data`, `profile.data?.job_role`, `profile.data?.job_role?.replaceAll`, `profile.data?.name`, `profile.data?.registration_number`, `provisional`, `reason`, `save.isPending`, `save.mutate`, `setBody`, `setContext`, `setEditing`, `templateTokens.map`, `templateTokens.map((token) => {{${token}}}).join`, `text.trim`, `uhid`, `value`, `value.frequency`, `value.frequency.trim`, `value.provisional`, `value.reason`, `value.reason.trim`, `window.confirm`

Input/label metadata: aria-label=Clinical note; aria-label=Saved notes and drafts; placeholder=e.g. Every 4 hours

### features/notes/progress-template.ts

Field references (includes local state): `Date.parse`, `Number.isFinite`, `capturedAt`, `d.description`, `d.status`, `diagnoses`, `new Date(snapshot.capturedAt).toLocaleString`, `new Date(value).toLocaleString`, `patient`, `snapshot.capturedAt`, `snapshot.diagnoses`, `snapshot.diagnoses
        .filter`, `snapshot.diagnoses
        .filter((d) => d.status === 'active')
        .map`, `snapshot.diagnoses
        .filter((d) => d.status === 'active')
        .map((d) => d.description)
        .join`, `snapshot.patient`, `snapshot.patient.name`, `snapshot.patient.uhid`, `snapshot.vitals`, `template.replace`, `v.bp_diastolic`, `v.bp_systolic`, `v.glucose`, `v.heart_rate`, `v.on_supplemental_oxygen`, `v.recorded_at`, `v.resp_rate`, `v.spo2`, `v.temperature`, `vitals`

Input/label metadata: None

### features/observations/clinical-alerts.tsx

Field references (includes local state): `JSON.stringify`, `Math.max`, `action.error`, `action.error.message`, `action.isError`, `action.isPending`, `action.mutate`, `action.reset`, `admissionId`, `alert.created_at`, `alert.id`, `alert.message`, `alert.resolution_reason`, `alert.severity`, `alert.status`, `alerts.data`, `alerts.data?.length`, `alerts.data?.map`, `alerts.isError`, `alerts.isFetching`, `alerts.isLoading`, `alerts.isSuccess`, `alerts.refetch`, `client.invalidateQueries`, `container.clientHeight`, `container.getBoundingClientRect`, `container.getBoundingClientRect().top`, `container.scrollTo`, `container.scrollTop`, `created_at`, `currentUser()?.id`, `event.preventDefault`, `event.target`, `event.target.value`, `focusedAlert.current`, `id`, `initialAlertId`, `kind`, `message`, `new Date(alert.created_at).toLocaleString`, `patientName`, `personal.review`, `personal.reviewed`, `personal.reviewed.includes`, `reason`, `reason.trim`, `reason.trim().length`, `resolution_reason`, `reviewKey`, `severity`, `status`, `target.current`, `target.current.clientHeight`, `target.current.closest`, `target.current.getBoundingClientRect`, `target.current.getBoundingClientRect().top`, `type`

Input/label metadata: aria-label=Clinical alerts

### features/observations/news2-summary.tsx

Field references (includes local state): `admissionId`, `due_status`, `error.status`, `frequency_minutes`, `new Date(query.data.next_due_at).toLocaleString`, `new Date(query.data.recorded_at).toLocaleString`, `news2_escalation`, `news2_rule_version`, `news2_score`, `next_due_at`, `query.data`, `query.data.due_status`, `query.data.news2_escalation`, `query.data.news2_escalation.replace`, `query.data.news2_rule_version`, `query.data.news2_score`, `query.data.next_due_at`, `query.data.recorded_at`, `query.isError`, `query.isFetching`, `query.isLoading`, `query.refetch`, `recorded_at`

Input/label metadata: None

### features/observations/observation-form.tsx

Field references (includes local state): `JSON.stringify`, `admissionId`, `client.invalidateQueries`, `defaultOpen`, `error.message`, `event.currentTarget`, `event.preventDefault`, `field.label`, `field.max`, `field.min`, `field.name`, `field.step`, `measurements.map`, `mutation.error`, `mutation.error.message`, `mutation.isError`, `mutation.isPending`, `mutation.mutate`, `mutation.reset`

Input/label metadata: label=Diastolic blood pressure (mmHg, optional); label=Heart rate (bpm); label=Oxygen saturation (%); label=Respiratory rate (breaths/min); label=Systolic blood pressure (mmHg); label=Temperature (°C); name=bp_diastolic; name=bp_systolic; name=consciousness; name=heart_rate; name=oxygen; name=resp_rate; name=spo2; name=temperature

### features/observations/observation-history.tsx

Field references (includes local state): `JSON.stringify`, `admissionId`, `bp_diastolic`, `bp_systolic`, `client.invalidateQueries`, `consciousness`, `due_status`, `error.status`, `event.preventDefault`, `event.target`, `event.target.value`, `frequency_minutes`, `heart_rate`, `history.data`, `history.data?.length`, `history.data?.map`, `history.isError`, `history.isLoading`, `history.refetch`, `id`, `new Date(schedule.data.next_due_at).toLocaleString`, `new Date(v.recorded_at).toLocaleString`, `news2_escalation`, `news2_score`, `next_due_at`, `on_supplemental_oxygen`, `reason`, `reason.trim`, `reason.trim().length`, `recorded_at`, `resp_rate`, `schedule.data`, `schedule.data.due_status`, `schedule.data.frequency_minutes`, `schedule.data.next_due_at`, `schedule.data.reason`, `schedule.data.source`, `schedule.isError`, `schedule.isLoading`, `schedule.refetch`, `source`, `spo2`, `temperature`, `update.error`, `update.error.message`, `update.isError`, `update.isPending`, `update.mutate`, `v.bp_diastolic`, `v.bp_systolic`, `v.consciousness`, `v.heart_rate`, `v.id`, `v.news2_escalation`, `v.news2_score`, `v.on_supplemental_oxygen`, `v.recorded_at`, `v.resp_rate`, `v.spo2`, `v.temperature`

Input/label metadata: None

### features/observations/observation-values.ts

Field references (includes local state): `form.get`

Input/label metadata: None

### features/observations/vitals-grid.tsx

Field references (includes local state): `cells.map`, `color`, `label`, `latest`, `latest.bp_diastolic`, `latest.bp_systolic`, `latest.glucose`, `latest.heart_rate`, `latest.resp_rate`, `latest.spo2`, `latest.temperature`, `latest?.bp_diastolic`, `latest?.bp_systolic`, `latest?.glucose`, `latest?.glucose?.toString`, `latest?.heart_rate`, `latest?.heart_rate?.toString`, `latest?.on_supplemental_oxygen`, `latest?.resp_rate`, `latest?.resp_rate?.toString`, `latest?.spo2`, `latest?.temperature`, `latest?.temperature?.toString`, `status`, `unit`, `v.label`, `v.status`, `v.status?.color`, `v.status?.label`, `v.unit`, `v.value`, `v.value.length`, `value`

Input/label metadata: aria-label=Latest vitals; label=Adequate; label=Afebrile; label=Blood Pressure; label=Body Temp; label=Bradycardia; label=Bradypnea; label=Cap Glucose; label=Critical; label=Febrile; label=HTN Crisis; label=Heart Rate; label=High; label=High fever; label=Hypotension; label=Hypothermia; label=Low; label=Low-grade fever; label=Normal; label=Resp Rate; label=SpO₂ Oxygen; label=Stage 1 HTN; label=Stage 2 HTN; label=Tachycardia; label=Tachypnea; label=Within range

### features/opd/opd-actions.tsx

Field references (includes local state): `JSON.stringify`, `Object.fromEntries`, `['dose', 'route', 'frequency', 'duration'].map`, `[...data.entries()].filter`, `body`, `brand`, `client.invalidateQueries`, `code`, `data.entries`, `description`, `diagnoses.data`, `diagnoses.data
                  ?.filter`, `diagnoses.data
                  ?.filter((item) => item.synthetic === false)
                  .map`, `event.currentTarget`, `event.preventDefault`, `followUp`, `id`, `investigations.data`, `investigations.data
                  ?.filter`, `investigations.data
                  ?.filter((item) => item.synthetic === false)
                  .map`, `item.brand`, `item.code`, `item.description`, `item.id`, `item.name`, `item.synthetic`, `medications.data`, `medications.data
                  ?.filter`, `medications.data
                  ?.filter((item) => item.synthetic === false)
                  .map`, `mutation.error`, `mutation.error?.message`, `mutation.isPending`, `mutation.mutate`, `name`, `path`, `status`, `synthetic`, `unit.id`, `unit.name`, `units.data`, `units.data?.map`, `visitId`

Input/label metadata: name=allergy_override_reason; name=code; name=diagnosis; name=medication_id; name=requested_unit_id

### features/opd/opd-checkin.tsx

Field references (includes local state): `JSON.stringify`, `String(form.get(key) ?? '').trim`, `allergen.trim`, `client.invalidateQueries`, `event.currentTarget`, `event.preventDefault`, `event.target`, `event.target.value`, `form.get`, `get('allergies')
      .split`, `get('allergies')
      .split(',')
      .map`, `get('allergies')
      .split(',')
      .map((allergen) => allergen.trim())
      .filter`, `get('allergies')
      .split(',')
      .map((allergen) => allergen.trim())
      .filter(Boolean)
      .map`, `get('complaints')
        .split`, `get('complaints')
        .split('\n')
        .map`, `get('complaints')
        .split('\n')
        .map((value) => value.trim())
        .filter`, `id`, `mutation.error`, `mutation.error.message`, `mutation.isError`, `mutation.isPending`, `mutation.mutate`, `new Date().toISOString`, `new Date().toISOString().slice`, `onCancel`, `onCreated`, `onDirtyChange`, `value.trim`, `visit.id`

Input/label metadata: name=allergies; name=complaints; name=conditions; name=dob; name=medications; name=name; name=notes; name=patient_id; name=phone; name=sex

### features/opd/opd-consultation.tsx

Field references (includes local state): `JSON.stringify`, `canEdit`, `client.invalidateQueries`, `close.error`, `close.isPending`, `close.mutate`, `consultation_note`, `error.message`, `event.preventDefault`, `event.target`, `event.target.value`, `follow_up`, `id`, `onDirtyChange`, `otherDirty`, `revision`, `save.error`, `save.isPending`, `save.mutate`, `savedNote.trim`, `status`, `updated.consultation_note`, `updated.follow_up`, `updated.revision`, `visit`, `visit.consultation_note`, `visit.follow_up`, `visit.id`, `visit.revision`, `visit.status`, `window.addEventListener`, `window.confirm`, `window.removeEventListener`

Input/label metadata: None

### features/opd/opd-dispatches.tsx

Field references (includes local state): `client.invalidateQueries`, `complete.error`, `complete.error.message`, `complete.isError`, `complete.isPending`, `complete.mutate`, `dispatch.id`, `dispatch.items`, `dispatch.items.length`, `dispatch.kind`, `dispatch.patient_name`, `dispatch.patient_uhid`, `dispatch.status`, `id`, `items`, `kind`, `patient_name`, `patient_uhid`, `query.data`, `query.data?.length`, `query.data?.map`, `query.isError`, `query.isLoading`, `query.refetch`, `status`, `synthetic`

Input/label metadata: None

### features/opd/opd-triage.tsx

Field references (includes local state): `JSON.stringify`, `body.diastolic`, `body.systolic`, `client.invalidateQueries`, `data.get`, `draftDirty`, `editable`, `event.currentTarget`, `event.preventDefault`, `field.label`, `field.max`, `field.min`, `field.name`, `field.step`, `fields.map`, `mutation.error`, `mutation.error.message`, `mutation.isError`, `mutation.isPending`, `mutation.mutate`, `onDirtyChange`, `revision`, `triage`, `triage.diastolic`, `triage.pulse`, `triage.spo2`, `triage.systolic`, `triage.temperature`, `triage.weight_kg`, `visitId`

Input/label metadata: label=Diastolic BP (mmHg); label=Pulse (bpm); label=SpO₂ (%); label=Systolic BP (mmHg); label=Temperature (°C); label=Weight (kg); name=diastolic; name=pulse; name=spo2; name=systolic; name=temperature; name=weight_kg

### features/opd/opd-visit.tsx

Field references (includes local state): `chief_complaints`, `chronic_conditions`, `code`, `consultation_note`, `created_at`, `currentUser()?.role`, `detail.data`, `detail.data.diagnoses`, `detail.data.diagnoses.map`, `detail.data.diagnoses.map((item) => item.code).join`, `detail.data.investigations`, `detail.data.investigations
                  .map`, `detail.data.investigations
                  .map((item) => item.code)
                  .join`, `detail.data.visit`, `detail.data.visit.chief_complaints`, `detail.data.visit.chief_complaints.join`, `detail.data.visit.chronic_conditions`, `detail.data.visit.consultation_note`, `detail.data.visit.follow_up`, `detail.data.visit.id`, `detail.data.visit.patient_notes`, `detail.data.visit.reported_medications`, `detail.data.visit.revision`, `detail.data.visit.status`, `detail.data.visit.token`, `detail.data.visit.triage`, `detail.isError`, `detail.isLoading`, `detail.refetch`, `diagnoses`, `dose`, `duration`, `follow_up`, `frequency`, `id`, `investigations`, `item.code`, `onBack`, `onDirtyChange`, `patient_id`, `patient_notes`, `prescriptions`, `reported_medications`, `revision`, `route`, `signed_at`, `status`, `token`, `triage`, `userId`, `visit`, `visitId`, `window.confirm`

Input/label metadata: None

### features/opd/opd.tsx

Field references (includes local state): `event.preventDefault`, `new Date(visit.created_at).toLocaleString`, `onDirtyChange`, `onSelect`, `queue.data`, `queue.data?.length`, `queue.data?.map`, `queue.isError`, `queue.isFetching`, `queue.isLoading`, `queue.refetch`, `userId`, `visit`, `visit.chief_complaints`, `visit.chief_complaints.join`, `visit.created_at`, `visit.id`, `visit.status`, `visit.token`, `window.addEventListener`, `window.confirm`, `window.removeEventListener`

Input/label metadata: aria-label=Outpatient visits

### features/orders/handover-order-composer.tsx

Field references (includes local state): `String(form.get(name) ?? '').trim`, `['medication', 'investigation', 'imaging', 'nursing'].includes`, `admissionId`, `create.isPending`, `create.mutateAsync`, `document.body`, `event.currentTarget`, `event.preventDefault`, `event.stopPropagation`, `form.get`, `onClose`, `patientLabel`, `priority.toLowerCase`, `taskText`

Input/label metadata: None

### features/orders/order-form.tsx

Field references (includes local state): `(doctors.data ?? []).filter`, `advisor.id`, `advisor.name`, `advisors.map`, `busy`, `category`, `doctors.data`, `doctors.isError`, `doctors.refetch`, `draftOnly`, `entry.id`, `error`, `event.stopPropagation`, `idPrefix`, `initialName`, `inline`, `onClose`, `onSubmit`, `orderCategories.map`, `patientLabel`, `self.id`, `self.name`, `self?.id`, `user?.name`, `user?.role`

Input/label metadata: aria-label=Close order form; name=advised_by; name=category; name=detail; name=dose; name=frequency; name=name; name=order-section; name=priority; name=route; placeholder=Dose and units; placeholder=Dose, route, indication or instructions as applicable; placeholder=Enter the requested medication, test or action; placeholder=e.g. Once, BD, daily; placeholder=e.g. PO, IV

### features/orders/orders-view.tsx

Field references (includes local state): `Array.from`, `Array.from(
          root.current?.querySelectorAll<HTMLElement>('[data-order-id]') ?? []
        ).find`, `Array.isArray`, `JSON.stringify`, `String(form.get(key) ?? '').trim`, `['cancelled', 'discontinued'].includes`, `['draft', 'confirmed'].includes`, `admission`, `admission.bed`, `admission.id`, `admission.patient_name`, `admission.ward`, `admission?.id`, `allOrders.filter`, `allOrders.find`, `bounds.top`, `busy`, `cancel.isPending`, `cancel.mutateAsync`, `categories
          .filter`, `categories
          .filter((category) => category !== 'nursing')
          .map`, `category`, `chart?.getBoundingClientRect`, `confirm.isPending`, `confirm.mutateAsync`, `create.isPending`, `create.mutateAsync`, `created.id`, `element.reset`, `embedded`, `event.currentTarget`, `event.preventDefault`, `event.target`, `event.target.checked`, `failure.message`, `fingerprint`, `focusedTarget.current`, `form.get`, `id`, `id.slice`, `initialCategory`, `initialOrderId`, `new Date(order.created_at).toLocaleString`, `onBack`, `onCancel`, `order`, `order.advised_by`, `order.advised_by_name`, `order.approval_status`, `order.created_at`, `order.created_by`, `order.id`, `order.kind`, `order.ordered_by_name`, `order.payload`, `order.payload.detail`, `order.payload.dose`, `order.payload.frequency`, `order.payload.high_risk`, `order.payload.imaging`, `order.payload.name`, `order.payload.route`, `order.payload.tasks`, `order.payload.tasks.map`, `order.payload.tasks.map(String).join`, `order.priority`, `order.requires_approval`, `order.status`, `orderCategories.filter`, `orderCategoryLabels[category].toLowerCase`, `orders`, `orders.data`, `orders.isError`, `orders.isLoading`, `orders.isSuccess`, `orders.length`, `orders.map`, `orders.refetch`, `payload.priority`, `payload.priority.toLowerCase`, `root.closest`, `root.current`, `root.current?.querySelector`, `root.current?.querySelectorAll`, `row.dataset`, `row.dataset.orderId`, `savedDraft.current`, `savedDraft.current.fingerprint`, `savedDraft.current.id`, `savedDraft.current?.id`, `shortcut`, `target.focus`, `target.getBoundingClientRect`, `target.scrollIntoView`, `viewport.bottom`, `viewport.top`, `visible.filter`

Input/label metadata: None

### features/patient-workflows/care-plan.tsx

Field references (includes local state): `action`, `action.mutate`, `admissionId`, `care`, `care.data`, `care.data?.generated`, `care.data?.generated.map`, `care.data?.items`, `care.data?.items.map`, `data`, `f.get`, `generated`, `items`, `role`, `submit`, `window.prompt`, `x.id`, `x.intervention`, `x.problem`, `x.revision`, `x.status`

Input/label metadata: name=intervention; name=problem; placeholder=Intervention; placeholder=Problem

### features/patient-workflows/care-transfer.tsx

Field references (includes local state): `['pending_release', 'pending_acceptance'].includes`, `action`, `action.mutate`, `admissionId`, `careTransfers`, `careTransfers.data`, `careTransfers.data?.map`, `data`, `doctors`, `doctors.data`, `doctors.data
            ?.filter`, `doctors.data
            ?.filter((user) => user.job_role === 'consultant')
            .map`, `f.get`, `id`, `job_role`, `name`, `submit`, `transfer.id`, `transfer.reason`, `transfer.status`, `transfer.status.replaceAll`, `user.id`, `user.job_role`, `user.name`

Input/label metadata: aria-label=New consultant; aria-label=Reason for consultant transfer; name=reason; name=to_consultant_id; placeholder=Reason; confirm discussion and family consent before submitting

### features/patient-workflows/claims.tsx

Field references (includes local state): `action`, `action.mutate`, `admissionId`, `c.id`, `c.policy_number`, `c.provider`, `claim.approved_limit`, `claim.currency`, `claim.current_usage`, `claim.estimate`, `claim.final_approved`, `claim.id`, `claim.revision`, `claim.status`, `claims`, `claims.data`, `claims.data.map`, `claims.data?.length`, `coverage`, `data`, `f.get`, `financeAccess`, `id`, `identity`, `identity.data`, `identity.data?.coverage`, `identity.data?.coverage.map`, `policy_number`, `provider`, `submit`, `window.prompt`

Input/label metadata: name=coverage; name=estimate; placeholder=Estimate

### features/patient-workflows/consultant-round.tsx

Field references (includes local state): `action`, `action.isPending`, `admissionId`, `f.get`, `submit`

Input/label metadata: name=assessment; name=objective; name=plan; name=subjective; placeholder=Assessment; placeholder=Objective; placeholder=Plan; placeholder=Subjective

### features/patient-workflows/discharge.tsx

Field references (includes local state): `['cancelled', 'completed'].includes`, `['pending_approval', 'approved'].includes`, `['pending_results', 'medication_reconciliation'].includes`, `action`, `action.error`, `action.error.message`, `action.isPending`, `action.mutate`, `admissionId`, `data`, `detail.data`, `detail.data?.tasks`, `detail.data?.tasks.map`, `event.preventDefault`, `event.target`, `event.target.value`, `f.get`, `finalDiagnosis.trim`, `new Date(String(f.get('planned'))).toISOString`, `plan`, `plan.discharge_type`, `plan.final_diagnosis`, `plan.id`, `plan.status`, `plan.summary`, `plans`, `plans.data`, `plans.data?.map`, `role`, `submit`, `summary.trim`, `task.code`, `task.id`, `task.status`, `tasks`, `window.prompt`

Input/label metadata: name=condition; name=follow_up; name=planned; name=type; placeholder=Condition at discharge; placeholder=Follow-up plan

### features/patient-workflows/doctor-coordination.tsx

Field references (includes local state): `['sent', 'seen', 'opinion', 'acknowledged'].includes`, `action.error`, `action.isPending`, `admissionId`, `doctors.error`, `doctors.isError`, `doctors.isLoading`, `doctors.isPending`, `doctors.refetch`, `id`, `job_role`, `kind`, `name`, `open`, `records.error`, `records.isError`, `records.isLoading`, `records.isPending`, `records.refetch`, `referrals.data`, `referrals.data?.find`, `row.admission_id`, `row.consultant_id`, `row.status`, `rows.filter`

Input/label metadata: None

### features/patient-workflows/doctor-workspace.tsx

Field references (includes local state): `admissionId`, `autoOpenClinical`, `children`, `currentUser()?.role`, `initialClinicalTarget`, `initialClinicalTarget.current`, `initialClinicalTarget.current?.focus`, `initialClinicalTarget.current?.scrollIntoView`, `initialClinicalTarget?.current`, `panel.description`, `panel.icon`, `panel.id`, `panel.title`, `panel.title.toLowerCase`, `panels.map`, `patientName`, `window.cancelAnimationFrame`, `window.requestAnimationFrame`

Input/label metadata: aria-label=Doctor’s notes workspace

### features/patient-workflows/movement-workspace.tsx

Field references (includes local state): `['requested', 'reserved', 'in_transit'].includes`, `action.error`, `admissionId`, `beds.error`, `beds.isError`, `beds.refetch`, `currentUser()?.role`, `error.status`, `hasManagedBed`, `id`, `kind`, `mode`, `movements.data`, `movements.data?.filter`, `movements.data?.some`, `movements.error`, `movements.isError`, `movements.isLoading`, `movements.isPending`, `movements.refetch`, `name`, `news2.data`, `news2.error`, `news2.isError`, `news2.isLoading`, `news2.refetch`, `news2_score`, `row.movement_type`, `row.status`, `units.error`, `units.isError`, `units.refetch`

Input/label metadata: None

### features/patient-workflows/movement.tsx

Field references (includes local state): `[
              'CT',
              'MRI',
              'cath_lab',
              'operation_theatre',
              'dialysis',
              'endoscopy',
            ].map`, `['inpatient', 'icu'].includes`, `['requested', 'reserved'].includes`, `action`, `action.isPending`, `action.mutate`, `admissionId`, `area`, `bed.id`, `bed.label`, `bed.ward_name`, `beds`, `beds.data`, `beds.data?.map`, `data`, `e.target`, `e.target.value`, `f.get`, `hasManagedBed`, `id`, `kind`, `label`, `movementBlocked`, `movementType`, `movements`, `movements.data`, `movements.data?.map`, `name`, `news2`, `news2.data`, `news2.data?.news2_score`, `news2_score`, `reservedBed`, `role`, `setArea`, `setReservedBed`, `setUnitId`, `submit`, `unit.id`, `unit.kind`, `unit.name`, `unitId`, `units`, `units.data`, `units.data
              ?.filter`, `units.data
              ?.filter((unit) => ['inpatient', 'icu'].includes(unit.kind))
              .map`, `ward_name`, `x.destination_area`, `x.id`, `x.movement_type`, `x.status`

Input/label metadata: aria-label=Destination bed; aria-label=Movement escort; aria-label=Transfer destination unit; aria-label=Visit destination; name=escort; name=reason; placeholder=Clinical reason

### features/patient-workflows/nursing-assessment.tsx

Field references (includes local state): `[
          ['m_history', 'Morse history: 0 or 25', 0, 25, 25],
          ['m_secondary', 'Morse secondary: 0 or 15', 0, 15, 15],
          ['m_aid', 'Morse aid: 0, 15, 30', 0, 30, 15],
          ['m_iv', 'Morse IV: 0 or 20', 0, 20, 20],
          ['m_gait', 'Morse gait: 0, 10, 20', 0, 20, 10],
          ['m_mental', 'Morse mental: 0 or 15', 0, 15, 15],
        ].map`, `['bmi', 'loss'].map`, `['sensory', 'moisture', 'activity', 'mobility', 'nutrition'].map`, `['situation', 'background', 'assessment'].map`, `action`, `action.mutate`, `admissionId`, `doctors`, `doctors?.map`, `event.currentTarget`, `event.preventDefault`, `f.get`, `form.reset`, `id`, `name`, `new Date().toISOString`, `x.id`, `x.name`

Input/label metadata: aria-label=Braden friction 1 to 3; aria-label=MUST acute 0 or 2; name=arrival; name=b_friction; name=belongings; name=category; name=dependence; name=direction; name=doctor; name=language; name=pain; name=pain_site; name=request; name=skin; name=transport; name=u_acute; name=volume; name=weight; placeholder=Arrival source; placeholder=Belongings; placeholder=Category; placeholder=Dependence level; placeholder=Language needs; placeholder=Pain 0–10; placeholder=Pain site; placeholder=Skin assessment; placeholder=Transport mode; placeholder=kg; placeholder=ml

### features/patient-workflows/nursing-tasks.tsx

Field references (includes local state): `action`, `action.mutate`, `admissionId`, `data`, `f.get`, `new Date(String(f.get('due'))).toISOString`, `new Date(String(x.due_at)).toLocaleString`, `role`, `submit`, `tasks`, `tasks.data`, `tasks.data?.map`, `x.description`, `x.due_at`, `x.id`

Input/label metadata: name=description; name=due; name=interval; placeholder=Interval minutes; placeholder=Task

### features/patient-workflows/nursing-workspace.tsx

Field references (includes local state): `action.error`, `admissionId`, `care.error`, `care.isError`, `care.isLoading`, `care.refetch`, `currentUser()?.role`, `generated`, `hasManagedBed`, `items`, `tasks.error`, `tasks.isError`, `tasks.isLoading`, `tasks.refetch`

Input/label metadata: None

### features/patient-workflows/patient-workflows.tsx

Field references (includes local state): `[plans, claims].find`, `[plans, claims].find((query) => query.isError)?.error`, `action.error`, `admissionId`, `coverage`, `doctors.data`, `hasManagedBed`, `id`, `job_role`, `name`, `patientId`, `plans.isLoading`, `policy_number`, `provider`, `query.isError`, `row.admission_id`, `rows.filter`, `user?.job_role`, `user?.role`

Input/label metadata: None

### features/patient-workflows/referrals.tsx

Field references (includes local state): `['sent', 'seen'].includes`, `action`, `action.mutate`, `admissionId`, `data`, `doctors`, `doctors.data`, `doctors.data
            ?.filter`, `doctors.data
            ?.filter((user) => user.job_role === 'consultant')
            .map`, `event.target`, `event.target.value`, `f.get`, `id`, `job_role`, `name`, `openReferral`, `openReferral.id`, `openReferral.question`, `openReferral.specialty`, `openReferral.status`, `referralConsultant`, `referrals`, `referrals.data`, `referrals.data.map`, `referrals.data?.length`, `setReferralConsultant`, `submit`, `user.id`, `user.job_role`, `user.name`, `x.id`, `x.question`, `x.specialty`, `x.status`

Input/label metadata: aria-label=Clinical question; aria-label=Referral consultant; aria-label=Referral specialty; aria-label=Referral urgency; aria-label=Relevant findings; name=consultant_id; name=findings; name=question; name=specialty; name=urgency; placeholder=Clinical question; placeholder=Relevant findings; placeholder=Specialty

### features/patient-workflows/shared.tsx

Field references (includes local state): `JSON.stringify`, `Promise.all`, `action.isPending`, `action.mutate`, `body`, `error`, `error.message`, `event.currentTarget`, `event.preventDefault`, `form.reset`, `id`, `method`, `path`, `pending.current`, `qc.invalidateQueries`, `status`

Input/label metadata: None

### features/patients/activity-vitals-loader.tsx

Field references (includes local state): `Date.parse`, `data?.pages`, `data?.pages.at`, `data?.pages.at(-1)?.at`, `element.closest`, `entries.some`, `entry.isIntersecting`, `last.recorded_at`, `marker.current`, `observer.disconnect`, `observer.observe`, `query`, `since`

Input/label metadata: None

### features/patients/clinical-canvas.tsx

Field references (includes local state): `(
            [
              ['overview', 'Overview'],
              ...(isNurse ? [['care', 'Nursing care'] as const] : []),
              ...(isDoctor ? [['notes', 'Doctor’s notes'] as const] : []),
              ['reports', 'Reports'],
              ['chat', 'Team chat'],
              ...(isDoctor
                ? []
                : [
                    [
                      'notes',
                      Notes${notes?.length ?  (${notes.length}) : ''},
                    ] as const,
                  ]),
            ] as const
          ).map`, `(['unstable', 'watcher', 'stable'] as const).map`, `(completeTask.error ?? cancelTask.error)?.message`, `(resolveDiagnosis.error ?? reopenDiagnosis.error)?.message`, `Date.now`, `Math.floor`, `NOTE_TEMPLATES.filter`, `NOTE_TEMPLATES.filter(
                        ([label]) => !isDoctor || label !== 'Nurse shift'
                      ).map`, `['care', 'orders', 'notes'].includes`, `['notes', 'orders', 'care'].includes`, `a.allergen`, `a.severity`, `action`, `active_alerts`, `active_referrals`, `active_shifts`, `admission`, `admission.admitted_at`, `admission.assigned_to`, `admission.bed`, `admission.bed_id`, `admission.id`, `admission.patient_dob`, `admission.patient_id`, `admission.patient_name`, `admission.patient_name
    .split`, `admission.patient_name
    .split(WHITESPACE)
    .slice`, `admission.patient_name
    .split(WHITESPACE)
    .slice(0, 2)
    .map`, `admission.patient_name
    .split(WHITESPACE)
    .slice(0, 2)
    .map((part) => part[0])
    .join`, `admission.patient_name
    .split(WHITESPACE)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase`, `admission.revision`, `admission.severity`, `admission.ward`, `admission?.id`, `admission?.patient_id`, `admissionId`, `age`, `allergen`, `allergies`, `allergies.length`, `allergies.map`, `approved_limit`, `assign.isPending`, `assign.mutateAsync`, `assigned_doctor`, `assigned_nurse`, `bed`, `body`, `body.trim`, `busy`, `c.body`, `c.id`, `cancelTask.error`, `cancelTask.isPending`, `cancelTask.mutate`, `cfg.bg`, `cfg.border`, `cfg.color`, `cfg.label`, `chart.current`, `chart.current.scrollTop`, `children`, `claim`, `claim_data_visible`, `completeTask.error`, `completeTask.isPending`, `completeTask.mutate`, `consultant`, `contextDraft`, `contingencies`, `contingencies.length`, `contingencies.map`, `counts`, `create.isPending`, `create.mutate`, `createDiagnosis.error`, `createDiagnosis.error?.message`, `createDiagnosis.isPending`, `createDiagnosis.mutate`, `createHandoff.isPending`, `createHandoff.mutateAsync`, `createNote.error`, `createNote.error.message`, `createNote.isPending`, `createNote.mutate`, `currency`, `currentUser()?.role`, `current_usage`, `del.isPending`, `del.mutate`, `discharge.isPending`, `discharge.mutate`, `documentPatient`, `e.body`, `e.id`, `e.logged_at`, `e.target`, `e.target.value`, `error`, `escalation`, `event.preventDefault`, `event.target`, `event.target.value`, `events`, `events.length`, `events.map`, `frequency`, `frequency.trim`, `headerSummary.data`, `headerSummary.data.claim`, `headerSummary.data.claim.approved_limit`, `headerSummary.data.claim.currency`, `headerSummary.data.claim.current_usage`, `headerSummary.data.claim_data_visible`, `headerSummary.data.consultant`, `headerSummary.data.consultant.name`, `headerSummary.data.consultant.specialty`, `headerSummary.data?.news2`, `headerSummary.data?.news2?.score`, `icon`, `initialAlertId`, `initialOrderCategory`, `initialOrderId`, `initialSection`, `isDoctor`, `label`, `messageId`, `n.author_stamp`, `n.clinical_context`, `n.clinical_context.observation_frequency`, `n.clinical_context.observation_reason`, `n.clinical_context.provisional_diagnoses`, `n.clinical_context.provisional_diagnoses.join`, `n.clinical_context.provisional_diagnoses.length`, `n.created_at`, `n.documentation_status`, `n.draft_body`, `n.id`, `n.kind`, `n.saved_at`, `name`, `new Date(admission.admitted_at).toLocaleDateString`, `new Date(dob).getTime`, `new Date(e.logged_at).toLocaleString`, `new Date(n.created_at).toLocaleDateString`, `news2`, `notes`, `notes.length`, `notes.map`, `notes?.length`, `onClose`, `onDischarged`, `onPatientUpdated`, `onSubmit`, `onViewOrders`, `patient`, `patient.blood_group`, `patient.id`, `patient.sex`, `patient?.abha_id`, `patient?.allergies`, `patient?.blood_group`, `patient?.sex`, `patient?.uhid`, `payer`, `pending_discharge_tasks`, `pending_orders`, `provisional`, `provisional
                  .split`, `provisional
                  .split('\n')
                  .map`, `provisional
                  .split('\n')
                  .map((text) => text.trim())
                  .filter`, `provisional.trim`, `reason`, `reason.trim`, `reopenDiagnosis.error`, `reopenDiagnosis.isPending`, `reopenDiagnosis.mutate`, `resolveDiagnosis.error`, `resolveDiagnosis.isPending`, `resolveDiagnosis.mutate`, `reviewKey`, `score`, `setBody`, `setContextDraft`, `severity`, `sex`, `specialty`, `stat_orders`, `submitLock.current`, `t.status`, `task.id`, `task.id.slice`, `task.order_kind`, `task.order_payload`, `task.order_payload.name`, `task.order_payload.tasks`, `task.status`, `tasks`, `tasks.filter`, `tasks.filter((t) => t.status === 'pending').length`, `tasks.length`, `tasks.map`, `text.trim`, `title`, `tpa_queries`, `uhid`, `unit_id`, `unsigned_handovers`, `updateAdmission.error`, `updateAdmission.error.message`, `updateAdmission.isError`, `updateAdmission.isPending`, `updateAdmission.mutate`, `val.trim`, `ward`

Input/label metadata: aria-label=Clinical note; aria-label=Delete contingency; aria-label=Doctor’s Orders; aria-label=Patient file sections; label=Stable; label=Unstable; placeholder=Add a contingency…; placeholder=Document assessment, shift updates, plan, contingencies and discharge considerations…; placeholder=Log a shift event…; placeholder=e.g. Every 4 hours; placeholder=e.g. Hypertensive heart disease

### features/patients/doctor-discharge-plan.tsx

Field references (includes local state): `action.error`, `admissionId`, `currentUser()?.role`, `plans.error`, `plans.isError`, `plans.isLoading`, `plans.refetch`

Input/label metadata: aria-label=Discharge planning

### features/patients/exceptional-exit-modal.tsx

Field references (includes local state): `EXIT_TYPES.map`, `busy`, `e.target`, `e.target.value`, `onClose`, `onSubmit`, `patientName`, `t.label`, `t.value`

Input/label metadata: aria-label=Close exceptional exit; label=Died; label=Transfer — Same Team; placeholder=Any discharge instructions or summary...; placeholder=e.g. St. John's Hospital, ICU

### features/patients/overview-details.tsx

Field references (includes local state): `children`, `onClose`, `open`, `patientName`, `title`, `title.toLowerCase`

Input/label metadata: None

### features/patients/patient-activity-feed.tsx

Field references (includes local state): `Array.isArray`, `Date.parse`, `admissionId`, `contingencies.data`, `entries`, `entries.filter`, `entries.map`, `entry.at`, `entry.body`, `entry.id`, `entry.kind`, `entry.title`, `event.target`, `event.target.value`, `events.data`, `failed.length`, `items`, `new Date(entry.at).toLocaleString`, `new Date(window.since).toLocaleString`, `notes.data`, `older.length`, `orders.data`, `queries.filter`, `queries.some`, `query.isError`, `query.isLoading`, `query.refetch`, `recent.length`, `recordSources.map`, `records[index]?.data`, `records[index]?.isError`, `result.items`, `shifts.data`, `shifts.isError`, `shifts.refetch`, `source.fields`, `source.key`, `source.kind`, `source.path`, `tasks.data`, `user?.id`, `vitals.data`, `vitals.data?.pages`, `vitals.data?.pages.flat`, `window.label`, `window.since`

Input/label metadata: key=assessments; key=care-history; key=consultant-rounds; key=discharge; key=movements; key=nursing-tasks; key=referrals; placeholder=Search notes, orders, updates…

### features/patients/patient-activity.ts

Field references (includes local state): `(group.rows ?? []).flatMap`, `(input.contingencies ?? []).map`, `(input.events ?? []).map`, `(input.notes ?? [])
      .filter`, `(input.notes ?? [])
      .filter((n) => n.documentation_status !== 'draft')
      .map`, `(input.orders ?? []).flatMap`, `(input.records ?? []).flatMap`, `(input.tasks ?? []).flatMap`, `(input.vitals ?? []).map`, `Array.isArray`, `Date.now`, `Date.parse`, `JSON.stringify`, `Number.isFinite`, `Object.keys`, `[
    ...(input.notes ?? [])
      .filter((n) => n.documentation_status !== 'draft')
      .map((n) =>
        entry(
          note:${n.id},
          n.saved_at ?? n.created_at,
          'Notes',
          n.kind,
          n.draft_body ?? 'No note body recorded'
        )
      ),
    ...(input.orders ?? []).flatMap(orderActivity),
    ...(input.tasks ?? []).flatMap(taskActivity),
    ...(input.vitals ?? []).map((v) =>
      entry(
        vitals:${v.id},
        v.recorded_at,
        'Observations',
        'Vitals recorded',
        values(v, [
          'bp_systolic',
          'bp_diastolic',
          'heart_rate',
          'spo2',
          'resp_rate',
          'temperature',
          'glucose',
        ])
      )
    ),
    ...(input.contingencies ?? []).map((c) =>
      entry(
        contingency:${c.id},
        c.created_at,
        'Contingencies',
        'Previously recorded contingency',
        c.body
      )
    ),
    ...(input.events ?? []).map((e) =>
      entry(
        event:${e.id},
        e.logged_at,
        'Shift events',
        'Previously recorded shift event',
        e.body
      )
    ),
    ...(input.records ?? []).flatMap((group) =>
      (group.rows ?? []).flatMap((row) => recordActivity(row, group))
    ),
  ]
    .filter`, `[
    ...(input.notes ?? [])
      .filter((n) => n.documentation_status !== 'draft')
      .map((n) =>
        entry(
          note:${n.id},
          n.saved_at ?? n.created_at,
          'Notes',
          n.kind,
          n.draft_body ?? 'No note body recorded'
        )
      ),
    ...(input.orders ?? []).flatMap(orderActivity),
    ...(input.tasks ?? []).flatMap(taskActivity),
    ...(input.vitals ?? []).map((v) =>
      entry(
        vitals:${v.id},
        v.recorded_at,
        'Observations',
        'Vitals recorded',
        values(v, [
          'bp_systolic',
          'bp_diastolic',
          'heart_rate',
          'spo2',
          'resp_rate',
          'temperature',
          'glucose',
        ])
      )
    ),
    ...(input.contingencies ?? []).map((c) =>
      entry(
        contingency:${c.id},
        c.created_at,
        'Contingencies',
        'Previously recorded contingency',
        c.body
      )
    ),
    ...(input.events ?? []).map((e) =>
      entry(
        event:${e.id},
        e.logged_at,
        'Shift events',
        'Previously recorded shift event',
        e.body
      )
    ),
    ...(input.records ?? []).flatMap((group) =>
      (group.rows ?? []).flatMap((row) => recordActivity(row, group))
    ),
  ]
    .filter((item) => Number.isFinite(Date.parse(item.at)))
    .sort`, `[row.created_at, row.recorded_at, row.assessed_at, row.signed_at].find`, `${item.kind} ${item.title} ${item.body} ${new Date(item.at).toLocaleString()}
        .toLocaleLowerCase`, `${item.kind} ${item.title} ${item.body} ${new Date(item.at).toLocaleString()}
        .toLocaleLowerCase()
        .includes`, `a.at`, `a.ends_at`, `a.id`, `a.id.localeCompare`, `a.starts_at`, `active.starts_at`, `at`, `b.at`, `b.ends_at`, `b.id`, `b.starts_at`, `body`, `c.body`, `c.created_at`, `c.id`, `contingencies`, `created_at`, `e.body`, `e.id`, `e.logged_at`, `ends_at`, `entries.filter`, `events`, `fields`, `group.fields`, `group.kind`, `group.rows`, `id`, `input.contingencies`, `input.events`, `input.notes`, `input.orders`, `input.records`, `input.tasks`, `input.vitals`, `item.at`, `item.body`, `item.kind`, `item.title`, `key.replaceAll`, `keys
    .flatMap`, `keys
    .flatMap((key) => {
      const value = record[key];
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        return [${key.replaceAll('_', ' ')}: ${value}];
      }
      if (Array.isArray(value)) {
        return [value.filter((item) => typeof item === 'string').join('; ')];
      }
      if (value && typeof value === 'object') {
        return [${key.replaceAll('_', ' ')}: ${JSON.stringify(value)}];
      }
      return [];
    })
    .join`, `kind`, `n.created_at`, `n.documentation_status`, `n.draft_body`, `n.id`, `n.kind`, `n.saved_at`, `new Date(item.at).toLocaleString`, `notes`, `order.acknowledged_at`, `order.confirmed_at`, `order.created_at`, `order.id`, `order.kind`, `order.payload`, `order.priority`, `order.status`, `orders`, `previous.starts_at`, `query.trim`, `query.trim().toLocaleLowerCase`, `query.trim().toLocaleLowerCase().split`, `query.trim().toLocaleLowerCase().split(WORDS).filter`, `records`, `row.assessed_at`, `row.created_at`, `row.id`, `row.recorded_at`, `row.signed_at`, `row.status`, `row.updated_at`, `rows`, `s.ends_at`, `s.starts_at`, `s.status`, `shifts.filter`, `started
    .filter`, `started
    .filter((s) => s.status === 'active')
    .sort`, `started
    .filter((s) => s.status === 'completed' && Date.parse(s.ends_at) <= now)
    .sort`, `starts_at`, `status`, `task.completed_at`, `task.created_at`, `task.id`, `task.order_kind`, `task.order_payload`, `task.status`, `tasks`, `title`, `updated_at`, `v.id`, `v.recorded_at`, `value.filter`, `value.filter((item) => typeof item === 'string').join`, `vitals`, `words.every`

Input/label metadata: label=Last 24 hours · no recorded shift; label=Since previous shift; label=This shift

### features/patients/patient-history.tsx

Field references (includes local state): `admission.admitted_at`, `admission.bed`, `admission.discharged_at`, `admission.id`, `admission.status`, `admission.ward`, `new Date(admission.admitted_at).toLocaleString`, `new Date(admission.discharged_at).toLocaleString`, `patientId`, `query.data`, `query.data?.length`, `query.data?.map`, `query.isError`, `query.isLoading`, `query.refetch`

Input/label metadata: None

### features/patients/patient-list.tsx

Field references (includes local state): `(
          [
            'all',
            'pending',
            ...(showAssignmentFilters
              ? (['unassigned', 'assigned'] as const)
              : []),
          ] as const
        ).map`, `(a.bed ?? '').toLowerCase`, `(a.bed ?? '').toLowerCase().includes`, `(a.ward ?? '').toLowerCase`, `(a.ward ?? '').toLowerCase().includes`, `Date.now`, `Math.floor`, `a.admitted_at`, `a.assigned_to`, `a.bed`, `a.id`, `a.patient_dob`, `a.patient_name`, `a.patient_name.toLowerCase`, `a.patient_name.toLowerCase().includes`, `a.ward`, `admission.arrival_status`, `admission.intake_pending`, `admissionId`, `admissions`, `admissions.filter`, `admissions.filter((a) => !!a.assigned_to).length`, `admissions.filter((a) => !a.assigned_to).length`, `admissions.filter(pendingIntake).length`, `admissions.length`, `bed`, `counts.all`, `counts.assigned`, `counts.pending`, `counts.unassigned`, `e.target`, `e.target.value`, `emptyMessage`, `new Date(admittedAt).getTime`, `new Date(dob).getTime`, `onSelect`, `search.toLowerCase`, `selected`, `selected?.id`, `showAssignmentFilters`, `v.bp_diastolic`, `v.bp_systolic`, `v?.bp_diastolic`, `v?.bp_systolic`, `v?.heart_rate`, `v?.heart_rate?.toString`, `visible.length`, `visible.map`

Input/label metadata: placeholder=Search patient, bed, or ward…

### features/patients/patient-navigation.ts

Field references (includes local state): `alertId`, `messageId`, `orderCategory`, `orderId`, `reviewKey`, `section`

Input/label metadata: None

### features/patients/patient-overview.tsx

Field references (includes local state): `Date.parse`, `a.created_at`, `admission`, `admission.id`, `admission.patient_id`, `admission.patient_name`, `b.created_at`, `context?.observation_frequency`, `context?.observation_reason`, `d.description`, `d.id`, `d.status`, `diagnoses`, `diagnoses
                    .filter`, `diagnoses
                    .filter((d) => d.status !== 'active')
                    .map`, `diagnoses.some`, `diagnosisBusy`, `diagnosisError`, `escalation`, `initialAlertId`, `isDoctor`, `isNurse`, `latestVitals`, `new Date(note.created_at).toLocaleString`, `news2`, `news2?.escalation`, `news2?.score`, `note.clinical_context`, `note.clinical_context.observation_reason`, `note.clinical_context?.observation_frequency`, `note.created_at`, `note.documentation_status`, `note?.clinical_context`, `notes`, `notes
    .filter`, `notes
    .filter((note) => note.documentation_status !== 'draft')
    .sort`, `notes
    .filter((note) => note.documentation_status !== 'draft')
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .find`, `onAddDiagnosis`, `onOpenNotes`, `onOpenReports`, `onRemoveDiagnosis`, `onReopenDiagnosis`, `previous.includes`, `reviewKey`, `score`, `visited.map`

Input/label metadata: aria-label=Current clinical status; aria-label=Observation plan; aria-label=Patient records

### features/patients/provisional-diagnoses.tsx

Field references (includes local state): `Math.abs`, `active.length`, `active.map`, `busy`, `diagnoses`, `diagnoses.filter`, `diagnosis`, `diagnosis.description`, `diagnosis.id`, `diagnosis.status`, `editable`, `error`, `event.clientX`, `event.clientY`, `onAdd`, `onRemove`, `start.current`, `start.current.x`, `start.current.y`, `x`, `y`

Input/label metadata: aria-label=Add provisional diagnosis; aria-label=Provisional diagnosis

### features/patients/rich-patient-card.tsx

Field references (includes local state): `(
        await Promise.all(
          batches.map((batch) =>
            apiFetch<CensusCard[]>(
              /dashboard/census-cards?ids=${batch.join(',')}
            )
          )
        )
      ).flat`, `Array.from`, `Math.ceil`, `Math.max`, `Math.min`, `Promise.all`, `[...readings].reverse`, `admission`, `admission.arrival_status`, `admission.bed`, `admission.id`, `admission.patient_name`, `admission.ward`, `admission_id`, `admissions.map`, `admissions.map((admission) => admission.id).sort`, `assigned_nurse`, `batch.join`, `batches.map`, `birth.getDate`, `birth.getFullYear`, `birth.getMonth`, `consultant`, `consultant.data`, `consultant.data.assigned_nurse`, `consultant.data.assigned_nurse.name`, `consultant.data?.assigned_nurse`, `data`, `diagnosis`, `dob`, `doctor_name`, `has_allergies`, `id`, `ids.length`, `ids.slice`, `isError`, `isLoading`, `name`, `news2_score`, `now.getDate`, `now.getFullYear`, `now.getMonth`, `onSelect`, `open_alerts`, `query.data`, `query.data.consultant`, `query.data.consultant.name`, `query.data?.consultant`, `query.isError`, `query.isLoading`, `recorded_at`, `scores`, `scores.length`, `scores.map`, `selected`, `sex`, `summary`, `summary.diagnosis`, `summary.dob`, `summary.sex`, `summary.sex?.slice`, `summary.sex?.slice(0, 1).toUpperCase`, `summary?.diagnosis`, `summary?.has_allergies`, `summary?.open_alerts`, `summary?.scores`, `summaryError`, `trailing`

Input/label metadata: None

### features/tasks/swipeable-task-card.tsx

Field references (includes local state): `Date.now`, `Math.floor`, `admission`, `admission.admitted_at`, `admission.bed`, `admission.patient_dob`, `admission.patient_name`, `admission.ward`, `motion.div`, `new Date(admittedAt).getTime`, `new Date(dob).getTime`, `offset`, `offset.x`, `offset.y`, `onSelect`, `onSwipe`, `sharedX`, `sharedY`, `x`, `y`

Input/label metadata: None

### features/tasks/task-deck.tsx

Field references (includes local state): `Math.min`, `Math.sqrt`, `a.id`, `admission.id`, `admissions`, `admissions.filter`, `dismissed.has`, `motion.div`, `onAccept`, `onEscalate`, `onRoute`, `onSelect`, `remaining.length`, `remaining[0].id`, `remaining[1].bed`, `remaining[1].patient_name`, `remaining[1].ward`, `topX.set`, `topY.set`

Input/label metadata: None

### features/wards/ward-census.tsx

Field references (includes local state): `admission_id`, `arrival_status`, `assigned_to`, `census.data`, `census.data?.length`, `census.data?.map`, `census.isError`, `census.isLoading`, `census.refetch`, `checkIn.error`, `checkIn.error.message`, `checkIn.isError`, `checkIn.isPending`, `checkIn.mutate`, `currentUser()?.job_role`, `event.target`, `event.target.value`, `id`, `label`, `name`, `onOpenPatient`, `patient_name`, `room_name`, `row.admission_id`, `row.arrival_status`, `row.assigned_to`, `row.label`, `row.patient_name`, `row.room_name`, `row.severity`, `severity`, `unit_id`, `userId`, `ward.id`, `ward.name`, `wards.data`, `wards.data.map`, `wards.isError`, `wards.isLoading`, `wards.refetch`

Input/label metadata: None

### features/wards/ward-console.tsx

Field references (includes local state): `Array.from`, `['All', ...wards].map`, `${a.patient_name} ${a.bed ?? ''}
        .toLowerCase`, `${a.patient_name} ${a.bed ?? ''}
        .toLowerCase()
        .includes`, `a.bed`, `a.patient_name`, `a.ward`, `active_shifts`, `admission.bed`, `admission.id`, `admission.patient_name`, `admission.severity`, `admissions`, `admissions
    .map`, `admissions
    .map((admission) => ({
      admission,
      census: {
        severity: admission.severity ?? 'unknown',
        patient_name: admission.patient_name,
        label: admission.bed ?? undefined,
      },
      details: details.get(admission.id),
    }))
    .sort`, `admissions
    .map((admission) => ({
      admission,
      census: {
        severity: admission.severity ?? 'unknown',
        patient_name: admission.patient_name,
        label: admission.bed ?? undefined,
      },
      details: details.get(admission.id),
    }))
    .sort((a, b) => comparePatients(a, b, sort))
    .map`, `admissions.filter`, `admissions.find`, `admissions.find((item) => item.unit_id)?.unit_id`, `admissions.length`, `admissions.map`, `admissions.map((a) => a.ward).filter`, `card.admission_id`, `cards.data`, `cards.data.some`, `cards.data?.find`, `cards.isError`, `cards.isSuccess`, `cards?.map`, `children`, `claim_data_visible`, `count`, `details.get`, `e.target`, `e.target.value`, `error`, `event.target`, `event.target.value`, `item.unit_id`, `loading`, `master_cautions`, `master_warnings`, `metrics.map`, `news_critical`, `news_warning`, `now.toLocaleTimeString`, `onSelect`, `onToggle`, `pending_orders`, `query.toLowerCase`, `selected`, `selected?.id`, `selected?.unit_id`, `selected?.ward`, `showCensus`, `stat_orders`, `summary.data`, `summary.data.active_shifts`, `summary.data.claim_data_visible`, `summary.data.master_cautions`, `summary.data.master_warnings`, `summary.data.news_critical`, `summary.data.news_warning`, `summary.data.pending_orders`, `summary.data.stat_orders`, `summary.data.tpa_queries`, `summary.data.unsigned_handovers`, `title`, `tpa_queries`, `unit`, `unit?.id`, `unit?.name`, `unsigned_handovers`, `visible.length`, `visible.slice`, `visible.slice(0, visibleCount).map`, `wards.length`, `window.clearInterval`, `window.matchMedia`, `window.matchMedia?.('(min-width: 768px)').matches`, `window.setInterval`

Input/label metadata: aria-label=Find patient by name or bed; aria-label=Sort rounds patients; placeholder=Find patient or bed

### features/worklist/personal-worklist.ts

Field references (includes local state): `Array.isArray`, `JSON.parse`, `JSON.stringify`, `admissions`, `canHide`, `census`, `census.map`, `hidden`, `hide`, `item.admission_id`, `item.due_at`, `item.id`, `item.priority`, `item.status`, `item.type`, `items`, `items
      .filter`, `items
      .filter((item) => item.admission_id === admissionId)
      .map`, `items
      .filter((item) => item.admission_id === admissionId)
      .map((item) => workItemKey(item, severity))
      .sort`, `items.filter`, `localStorage.getItem`, `localStorage.setItem`, `next[kind].slice`, `onOpen`, `open`, `patient.admission_id`, `patient.id`, `patient.severity`, `patientDestinations.care`, `patientDestinations.overview`, `personal.hidden`, `personal.hidden.includes`, `personal.hidden.length`, `personal.hide`, `personal.reviewed`, `personal.reviewed.includes`, `personal.undo`, `reviewed`, `severities.get`, `severities.set`, `undo`, `userId`, `value.hidden`, `value.hidden.filter`, `value.reviewed`, `value.reviewed.filter`, `value?.hidden`, `value?.reviewed`, `window.addEventListener`, `window.dispatchEvent`, `window.removeEventListener`

Input/label metadata: None

### features/worklist/shift-summary.tsx

Field references (includes local state): `action`, `current.ends_at`, `current.id`, `current.starts_at`, `current?.unit_ids`, `current?.unit_ids.map`, `ends_at`, `id`, `name`, `names?.join`, `new Date(current.ends_at).toLocaleString`, `new Date(current.starts_at).toLocaleString`, `new Date(shift.ends_at).toLocaleString`, `new Date(shift.starts_at).toLocaleString`, `queryClient.invalidateQueries`, `shift.ends_at`, `shift.id`, `shift.starts_at`, `shift.status`, `shift.unit_ids`, `shift.unit_ids
                    .map`, `shift.unit_ids
                    .map(
                      (id) =>
                        units.data?.find((unit) => unit.id === id)?.name ??
                        'Unit unavailable'
                    )
                    .join`, `shifts.data`, `shifts.data
          ?.filter`, `shifts.data
          ?.filter((shift) => shift.status === 'scheduled')
          .map`, `shifts.data?.find`, `shifts.isError`, `shifts.isFetching`, `shifts.isLoading`, `shifts.refetch`, `starts_at`, `status`, `transition.error`, `transition.error.message`, `transition.isError`, `transition.isPending`, `transition.mutate`, `unit.id`, `unit_ids`, `units.data`, `units.data?.find`, `units.data?.find((unit) => unit.id === id)?.name`, `units.isError`, `units.isFetching`, `units.isLoading`, `units.refetch`, `userId`, `window.confirm`

Input/label metadata: None

### features/worklist/worklist.tsx

Field references (includes local state): `[item.ward, item.bed && Bed ${item.bed}]
                      .filter`, `[item.ward, item.bed && Bed ${item.bed}]
                      .filter(Boolean)
                      .join`, `admission.id`, `admission.patient_id`, `admission.status`, `admission_id`, `admissions`, `admissions.find`, `bed`, `controller.signal`, `controller.signal.aborted`, `data?.length`, `data?.map`, `due_at`, `error.message`, `id`, `item.admission_id`, `item.bed`, `item.due_at`, `item.id`, `item.patient_name`, `item.priority`, `item.status`, `item.status.replaceAll`, `item.type`, `item.ward`, `new Date(item.due_at).toLocaleString`, `onOpenPatient`, `patient.dob`, `patient.name`, `patient_name`, `priority`, `request.current`, `request.current?.abort`, `status`, `type`, `userId`, `ward`

Input/label metadata: aria-label=Worklist items

### lib/api/client.ts

Field references (includes local state): `(await checkedResponse(path, init)).blob`, `Object.assign`, `body.error`, `config.backendUrl`, `detail.message`, `err.message`, `headers.has`, `headers.set`, `init?.body`, `init?.headers`, `localStorage.getItem`, `message`, `res.json`, `res.json().catch`, `res.ok`, `res.status`, `res.statusText`, `status`

Input/label metadata: None

### lib/api/events.ts

Field references (includes local state): `boundary.index`, `boundary[0].length`, `buffer.slice`, `frame
          .split`, `frame
          .split(lineBreak)
          .filter`, `frame
          .split(lineBreak)
          .filter((line) => line.startsWith('data:'))
          .map`, `frame
          .split(lineBreak)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart())
          .join`, `frameBoundary.exec`, `line.slice`, `line.slice(5).trimStart`, `line.startsWith`, `reader.cancel`, `reader.cancel().catch`, `reader.read`, `response.body`, `response.body.pipeThrough`, `response.body.pipeThrough(new TextDecoderStream()).getReader`, `response.ok`, `response.status`, `signal.aborted`

Input/label metadata: None

### lib/api/hooks.ts

Field references (includes local state): None

Input/label metadata: None

### lib/api/queries/admissions.ts

Field references (includes local state): `JSON.stringify`, `assigned_to`, `bed`, `exit_dest`, `exit_note`, `exit_type`, `expected_revision`, `filters.assigned_to`, `filters.ward`, `filters?.assigned_to`, `filters?.ward`, `id`, `nurse_id`, `params.set`, `params.toString`, `qc.invalidateQueries`, `severity`, `ward`

Input/label metadata: None

### lib/api/queries/chat.ts

Field references (includes local state): `JSON.stringify`, `attachments`, `author_id`, `author_name`, `body`, `body.append`, `byte_size`, `content_type`, `created_at`, `edited_at`, `expected_revision`, `filename`, `id`, `job_role`, `last.at`, `last.at(-1)?.id`, `last.length`, `mention_ids`, `mentions`, `message_id`, `name`, `params.set`, `patient_id`, `revision`, `superseded_at`, `text`

Input/label metadata: None

### lib/api/queries/claims.ts

Field references (includes local state): `JSON.stringify`, `action`, `approved_limit`, `claim.id`, `current_usage`, `estimate`, `expected_revision`, `id`, `note`, `qc.invalidateQueries`, `qc.setQueryData`

Input/label metadata: None

### lib/api/queries/consultations.ts

Field references (includes local state): `JSON.stringify`, `admission_id`, `assessment`, `call_again`, `due_at`, `id`, `impression`, `kind`, `objective`, `orders`, `payload`, `plan`, `priority`, `qc.invalidateQueries`, `recommendations`, `result.round`, `result.round.admission_id`, `round`, `subjective`

Input/label metadata: None

### lib/api/queries/coordination.ts

Field references (includes local state): `JSON.stringify`, `acknowledged_at`, `acknowledged_by`, `admissionId`, `admission_id`, `assigned_to`, `body`, `contingencyId`, `created_by`, `currentUser()?.id`, `done_at`, `id`, `incoming_doctor_id`, `itemId`, `logged_by`, `notes`, `qc.invalidateQueries`, `reason`, `requested_at`, `requested_by`, `status`, `user_id`, `ward`

Input/label metadata: None

### lib/api/queries/discharge.ts

Field references (includes local state): `JSON.stringify`, `admission_id`, `condition`, `discharge_type`, `evidence`, `follow_up`, `form_version_id`, `id`, `plan.admission_id`, `plan.id`, `planned_at`, `qc.invalidateQueries`, `summary`, `task.plan_id`

Input/label metadata: None

### lib/api/queries/handover.ts

Field references (includes local state): `JSON.stringify`, `acknowledge_stale`, `action_list`, `body`, `checklist`, `contingency`, `detail.session`, `detail.session.id`, `discrepancies`, `handover_notes`, `id`, `incoming_nurse_id`, `item.session_id`, `itemId`, `patient_summary`, `qc.invalidateQueries`, `qc.setQueryData`, `readback`, `receiver_view`, `session.id`, `ward`, `ward.trim`, `ward?.trim`

Input/label metadata: None

### lib/api/queries/health.ts

Field references (includes local state): `backend.data`, `backend.data.status`, `backend.isError`, `backend.isLoading`, `navigator.onLine`, `status`, `window.addEventListener`, `window.removeEventListener`

Input/label metadata: None

### lib/api/queries/intake.ts

Field references (includes local state): `JSON.stringify`, `admission`, `admission.id`, `allergen`, `allergies`, `bed_id`, `body`, `chief_complaint`, `clinical_handover`, `clinical_impression`, `consultant_id`, `diagnosis`, `dob`, `evidence`, `examination`, `history`, `id`, `item.admission_id`, `name`, `nurse_id`, `patient_id`, `phone`, `plan`, `qc.invalidateQueries`, `query.trim`, `query.trim().length`, `reaction`, `reason`, `request`, `requested_unit_id`, `severity`, `sex`, `source`

Input/label metadata: None

### lib/api/queries/opd.ts

Field references (includes local state): `JSON.stringify`, `allergen`, `allergies`, `allergy_override_reason`, `charges`, `chief_complaints`, `chronic_conditions`, `code`, `consultation_note`, `diagnosis`, `diastolic`, `dob`, `dose`, `duration`, `expected_revision`, `follow_up`, `frequency`, `id`, `medication_id`, `name`, `patient`, `patient_id`, `patient_notes`, `phone`, `pulse`, `qc.invalidateQueries`, `qc.setQueryData`, `query.trim`, `query.trim().length`, `reaction`, `reported_medications`, `requested_unit_id`, `route`, `severity`, `sex`, `spo2`, `systolic`, `temperature`, `visit`, `visit.id`, `visitId`, `visit_id`, `weight_kg`

Input/label metadata: None

### lib/api/queries/orders.ts

Field references (includes local state): `JSON.stringify`, `admissionId`, `advised_by`, `confirmed_by`, `decision`, `due_at`, `kind`, `order`, `order.admission_id`, `orderId`, `payload`, `priority`, `qc.invalidateQueries`, `reason`, `requires_approval`, `result.order`, `result.order.admission_id`, `task`

Input/label metadata: None

### lib/api/queries/patients.ts

Field references (includes local state): `JSON.stringify`, `Promise.all`, `admissionId`, `clinical_context`, `completed_by`, `created_by`, `d.patient_id`, `description`, `draft_body`, `expected_revision`, `id`, `kind`, `noteId`, `patient.id`, `patient_id`, `qc.invalidateQueries`, `qc.setQueryData`, `variables.completed_by`, `variables.id`

Input/label metadata: None

### lib/api/queries/staff.ts

Field references (includes local state): `Promise.all`, `censuses.flat`, `ward.id`, `wards.map`

Input/label metadata: None

### lib/api/queries/users.ts

Field references (includes local state): None

Input/label metadata: None

### lib/api/queries/vitals.ts

Field references (includes local state): `JSON.stringify`, `admissionId`, `bp_diastolic`, `bp_systolic`, `glucose`, `heart_rate`, `page.at`, `page.at(-1)?.id`, `page.length`, `page.some`, `qc.invalidateQueries`, `recorded_by`, `resp_rate`, `spo2`, `temperature`, `vital.id`

Input/label metadata: None

### lib/api/types.ts

Field references (includes local state): `abha_id`, `accepted_at`, `acknowledged_at`, `acknowledged_by`, `acknowledgment`, `action_list`, `active_shifts`, `actor_id`, `address`, `admission_id`, `admitted_at`, `advised_by`, `advised_by_name`, `airway_checked_or_not_applicable`, `alarms`, `allergen`, `allergies`, `allergy_band`, `allergy_override_reason`, `approval_at`, `approval_by`, `approval_reason`, `approval_status`, `approved_at`, `approved_by`, `approved_limit`, `arrival_status`, `arrived_at`, `assessment`, `assigned_doctor_id`, `assigned_to`, `author_id`, `author_stamp`, `bed`, `bed_id`, `blood_group`, `body`, `bp_diastolic`, `bp_systolic`, `brand`, `calculated_at`, `call_again`, `category`, `charges`, `checklist`, `chief_complaints`, `chronic_conditions`, `claim`, `claim_data_visible`, `claim_id`, `clinical_context`, `clinical_handover`, `closed_at`, `code`, `completed_at`, `completed_by`, `condition`, `confirmed_at`, `confirmed_by`, `consultant_id`, `consultation_amount`, `consultation_note`, `contacts`, `contingencies`, `contingency`, `coverage`, `coverage_id`, `created_at`, `created_by`, `currency`, `current_usage`, `decline_reason`, `department_id`, `description`, `designation`, `diagnosed_at`, `diagnoses`, `diagnosis`, `disabled_at`, `discharge_type`, `discharged_at`, `discrepancies`, `dob`, `documentation_status`, `dose`, `draft_body`, `drug_class`, `due_at`, `duration`, `enhancement_pending`, `estimate`, `events`, `evidence`, `exit_dest`, `exit_note`, `exit_type`, `fall_precautions`, `fields`, `final_approved`, `findings`, `follow_up`, `form_version_id`, `frequency`, `from_doctor_id`, `glucose`, `handover_notes`, `heart_rate`, `id`, `identifiers`, `identity_band`, `impression`, `in_stock`, `incoming_doctor_id`, `incoming_nurse_id`, `ingredient`, `intake_pending`, `investigation_amount`, `investigations`, `is_primary`, `issuer`, `item_id`, `item_version`, `items`, `job_role`, `kind`, `label`, `last_round_at`, `latest_note`, `lines_and_drains`, `logged_at`, `logged_by`, `master_cautions`, `master_warnings`, `medication_id`, `member_id`, `message`, `name`, `news2`, `news2_score`, `news_critical`, `news_warning`, `next_of_kin`, `note`, `note_id`, `notes`, `objective`, `observation_frequency`, `observation_reason`, `observations`, `occupancy`, `on_supplemental_oxygen`, `opd_visit_id`, `operational_state`, `opinion_at`, `opinion_note_id`, `order_id`, `order_kind`, `order_payload`, `ordered_by_name`, `orders`, `outgoing_doctor_id`, `outgoing_nurse_id`, `oxygen_and_suction`, `patient`, `patient_dob`, `patient_id`, `patient_name`, `patient_notes`, `patient_summary`, `payer_name`, `payload`, `pending_orders`, `phone`, `plan`, `plan_id`, `planned_at`, `policy_number`, `prescriptions`, `pressure_areas`, `price`, `priority`, `provisional_diagnoses`, `pump_rates`, `queries`, `question`, `raised_at`, `raised_by`, `reaction`, `read_at`, `readback`, `receiver_view`, `recommendations`, `recorded_at`, `recorded_by`, `registration_number`, `relationship`, `replied_at`, `replied_by`, `reply`, `reported_medications`, `requested_at`, `requested_by`, `requested_unit_id`, `requires_approval`, `resolved_at`, `resolved_by`, `resp_rate`, `reviewed_by`, `revision`, `role`, `room_id`, `room_name`, `route`, `saved_at`, `score`, `seen_at`, `seen_today`, `sent_at`, `session`, `session_id`, `severity`, `sex`, `shift_events`, `signed_at`, `signed_by`, `snapshot`, `snapshot_revision`, `source`, `specialization`, `specialty`, `spo2`, `stale`, `stale_acknowledged`, `stat_orders`, `status`, `subjective`, `summary`, `summary_signed_at`, `summary_signed_by`, `synthetic`, `tasks`, `temperature`, `template_id`, `template_version_id`, `to_doctor_id`, `token`, `total_amount`, `tpa_queries`, `triage`, `type`, `uhid`, `unit_id`, `unsigned_handovers`, `updated_at`, `urgency`, `user_id`, `valid_from`, `valid_until`, `value`, `version`, `visit`, `visit_id`, `ward`, `ward_id`, `ward_name`

Input/label metadata: None
