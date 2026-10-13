import { describe, it, expect, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LhForm, LhFormItem } from '../../src/components/form'
import { LhInput } from '../../src/components/input'
import { LhSelect } from '../../src/components/select'
import type { LhFormInstance } from '../../src/components/form'
import { createRef } from 'react'

function setup(jsx: React.ReactElement) {
  return render(jsx)
}

/** <form> 无可访问名时不暴露 role=form，统一用标签名查询 */
function getForm(container: HTMLElement) {
  return container.querySelector('form')
}

describe('LhForm / LhFormItem', () => {
  it('渲染 form 与 item 结构', () => {
    const { container } = setup(
      <LhForm model={{ name: '' }}>
        <LhFormItem label="姓名" prop="name">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    expect(getForm(container)).toHaveClass('lh-form')
    expect(screen.getByText('姓名')).toHaveClass('lh-form-item__label')
    expect(screen.getByText('姓名').closest('.lh-form-item')).not.toBeNull()
  })

  it('required 渲染必填星号', () => {
    setup(
      <LhForm model={{}}>
        <LhFormItem label="字段" prop="f" required>
          <input />
        </LhFormItem>
      </LhForm>,
    )
    expect(screen.getByText('*')).toHaveClass('lh-form-item__required')
  })

  it('inline 类名', () => {
    const { container } = setup(
      <LhForm model={{}} inline>
        <LhFormItem prop="f" label="f">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    expect(getForm(container)).toHaveClass('lh-form--inline')
  })

  it('labelWidth 透传为标签宽度', () => {
    setup(
      <LhForm model={{}} labelWidth={120}>
        <LhFormItem prop="f" label="字段">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    expect(screen.getByText('字段')).toHaveStyle({ width: '120px' })
  })

  it('rules 必填校验失败时渲染错误提示（role=alert）', async () => {
    setup(
      <LhForm model={{ name: '' }} rules={{ name: [{ required: true, message: '必填项' }] }}>
        <LhFormItem prop="name" label="姓名">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    const input = screen.getByRole('textbox')
    await act(async () => {
      input.focus()
      input.blur()
    })
    expect(await screen.findByText('必填项')).toHaveClass('lh-form-item__error')
  })

  it('item 级 rules 覆盖 form 级同名规则', async () => {
    setup(
      <LhForm model={{ name: '' }} rules={{ name: [{ required: true, message: '全局文案' }] }}>
        <LhFormItem prop="name" label="姓名" rules={[{ required: true, message: '局部文案' }]}>
          <input />
        </LhFormItem>
      </LhForm>,
    )
    await act(async () => {
      screen.getByRole('textbox').focus()
      screen.getByRole('textbox').blur()
    })
    expect(await screen.findByText('局部文案')).toBeInTheDocument()
  })

  it('校验失败时控件标记 aria-invalid', async () => {
    // aria-invalid 由 LhInput 从 FormItem 上下文读取后打到原生 input 上，裸 input 不会获得
    setup(
      <LhForm model={{ name: '' }} rules={{ name: [{ required: true, message: '必填' }] }}>
        <LhFormItem prop="name" label="姓名">
          <LhInput />
        </LhFormItem>
      </LhForm>,
    )
    const input = screen.getByRole('textbox')
    await act(async () => {
      input.focus()
      input.blur()
    })
    await waitFor(() => expect(input).toHaveAttribute('aria-invalid', 'true'))
  })

  it('命令式 validate：通过时返回 true', async () => {
    const ref = createRef<LhFormInstance>()
    setup(
      <LhForm ref={ref} model={{ name: '张三' }} rules={{ name: [{ required: true }] }}>
        <LhFormItem prop="name" label="姓名">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    await expect(ref.current!.validate()).resolves.toBe(true)
  })

  it('命令式 validate：失败时返回 false', async () => {
    const ref = createRef<LhFormInstance>()
    setup(
      <LhForm ref={ref} model={{ name: '' }} rules={{ name: [{ required: true }] }}>
        <LhFormItem prop="name" label="姓名">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    await expect(ref.current!.validate()).resolves.toBe(false)
  })

  it('命令式 validateField：只校验指定字段', async () => {
    const ref = createRef<LhFormInstance>()
    setup(
      <LhForm ref={ref} model={{ a: '', b: 'ok' }} rules={{ a: [{ required: true }] }}>
        <LhFormItem prop="a" label="A">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    await expect(ref.current!.validateField('a')).resolves.toBe(false)
  })

  it('异步 validator 正确等待（plus 版的 Promise.resolve(!message) 缺陷修正）', async () => {
    const ref = createRef<LhFormInstance>()
    setup(
      <LhForm
        ref={ref}
        model={{ code: '123' }}
        rules={{ code: [{ validator: async () => '校验失败' }] }}
      >
        <LhFormItem prop="code" label="验证码">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    await expect(ref.current!.validateField('code')).resolves.toBe(false)
  })

  it('resetField 还原初始值', async () => {
    const ref = createRef<LhFormInstance>()
    const model = { name: '初始' }
    setup(
      <LhForm ref={ref} model={model} rules={{ name: [{ required: true }] }}>
        <LhFormItem prop="name" label="姓名">
          <input />
        </LhFormItem>
      </LhForm>,
    )
    model.name = '改后'
    await act(async () => {
      ref.current!.resetField('name')
    })
    expect(model.name).toBe('初始')
  })

  it('失焦在 item 内部移动不触发校验', async () => {
    setup(
      <LhForm model={{ name: '' }} rules={{ name: [{ required: true, message: '必填' }] }}>
        <LhFormItem prop="name" label="姓名">
          <input data-testid="a" />
          <input data-testid="b" />
        </LhFormItem>
      </LhForm>,
    )
    const a = screen.getByTestId('a')
    const b = screen.getByTestId('b')
    await act(async () => {
      a.focus()
      b.focus()
    })
    expect(screen.queryByText('必填')).toBeNull()
  })

  it('点击标签聚焦内容区首个可聚焦元素', async () => {
    const user = userEvent.setup()
    setup(
      <LhForm model={{}}>
        <LhFormItem prop="f" label="字段">
          <input data-testid="target" />
        </LhFormItem>
      </LhForm>,
    )
    await user.click(screen.getByText('字段'))
    expect(screen.getByTestId('target')).toHaveFocus()
  })

  it('onSubmit 阻止默认表单提交', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    setup(
      <LhForm model={{}} onSubmit={onSubmit}>
        <LhFormItem prop="f" label="字段">
          <input />
        </LhFormItem>
        <button type="submit">提交</button>
      </LhForm>,
    )
    await user.click(screen.getByRole('button', { name: '提交' }))
    expect(onSubmit).toHaveBeenCalledOnce()
  })

  it('D-05：trigger=change 的规则随内容区 change 冒泡校验', async () => {
    const user = userEvent.setup()
    setup(
      <LhForm
        model={{ code: '' }}
        rules={{ code: [{ required: true, message: '必填', trigger: 'change' }] }}
      >
        <LhFormItem prop="code" label="代号">
          <input data-testid="code" />
        </LhFormItem>
      </LhForm>,
    )
    const input = screen.getByTestId('code')
    // 有内容时 change 校验通过
    await user.type(input, 'x')
    expect(screen.queryByText('必填')).toBeNull()
    // 清空后 change 校验报错
    await user.clear(input)
    await waitFor(() => {
      expect(screen.getByText('必填')).toBeInTheDocument()
    })
  })

  it('D-05：未标注 trigger 的规则不响应 change（只在失焦 / validate 时跑）', async () => {
    const user = userEvent.setup()
    setup(
      <LhForm model={{ code: '' }} rules={{ code: [{ required: true, message: '必填' }] }}>
        <LhFormItem prop="code" label="代号">
          <input data-testid="code" />
        </LhFormItem>
      </LhForm>,
    )
    await user.type(screen.getByTestId('code'), 'x')
    expect(screen.queryByText('必填')).toBeNull()
  })

  it('D-06：resetFields 清除各字段的错误态', async () => {
    const ref = createRef<LhFormInstance>()
    const model = { name: '' }
    setup(
      <LhForm ref={ref} model={model} rules={{ name: [{ required: true, message: '必填' }] }}>
        <LhFormItem prop="name" label="姓名">
          <input data-testid="name" />
        </LhFormItem>
      </LhForm>,
    )
    const input = screen.getByTestId('name')
    await act(async () => {
      input.focus()
      input.blur()
    })
    await waitFor(() => {
      expect(screen.getByText('必填')).toBeInTheDocument()
    })
    await act(async () => {
      ref.current!.resetFields()
    })
    expect(screen.queryByText('必填')).toBeNull()
  })

  it('D-05：change 规则在输入合法后立即清除错误（不滞后一拍）', async () => {
    const user = userEvent.setup()
    const ref = createRef<LhFormInstance>()
    setup(
      <LhForm
        ref={ref}
        model={{ code: '' }}
        rules={{ code: [{ required: true, message: '必填', trigger: 'change' }] }}
      >
        <LhFormItem prop="code" label="代号">
          <LhInput placeholder="代号" />
        </LhFormItem>
      </LhForm>,
    )
    await act(async () => {
      await ref.current!.validate()
    })
    await waitFor(() => {
      expect(screen.getByText('必填')).toBeInTheDocument()
    })
    // 同一拍输入合法值：事件目标的新值立即参与校验，无需等父级 setState 落地
    await user.type(screen.getByPlaceholderText('代号'), 'x')
    await waitFor(() => {
      expect(screen.queryByText('必填')).toBeNull()
    })
  })

  it('D-05：LhSelect 选中选项主动触发 change 校验并清除错误', async () => {
    const ref = createRef<LhFormInstance>()
    setup(
      <LhForm
        ref={ref}
        model={{ style: '' }}
        rules={{ style: [{ required: true, message: '必选', trigger: 'change' }] }}
      >
        <LhFormItem prop="style" label="画风">
          <LhSelect
            placeholder="请选择画风"
            options={[
              { label: '水墨', value: 'ink' },
              { label: '丹青', value: 'danqing' },
            ]}
          />
        </LhFormItem>
      </LhForm>,
    )
    await act(async () => {
      await ref.current!.validate()
    })
    await waitFor(() => {
      expect(screen.getByText('必选')).toBeInTheDocument()
    })
    // 选项点击只产生 click 事件，无原生 change 冒泡，靠控件主动调 validateChange
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(await screen.findByRole('option', { name: '水墨' }))
    await waitFor(() => {
      expect(screen.queryByText('必选')).toBeNull()
    })
  })
})
