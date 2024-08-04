export default function Button() {
  return {
    defaultProps: {
      disableElevation: true,
    },

    styleOverrides: {
      root: ({ ownerState, theme }) => ({
        fontSize: '16px',
        fontWeight: '500',
        lineHeight: '24px',
        minWidth: '30px',
        borderRadius: '30px',
        padding: '10px 20px',
        textTransform: 'none',
        '&.MuiButtonBase-root': {
          color: `${theme.palette[ownerState.color].text}` || 'defaultColor',
        },

        ...(ownerState.variant === 'danger' && {
          borderRadius: '11px',
          padding: '8px 10px',
          color: `#fff!important`,
          background: `${theme.palette.danger.secondary}`,
          '&:hover': {
            // border: `1px solid ${theme.palette.danger.secondary}`,
            background: theme.palette.danger.secondary,
          },
        }),
        ...(ownerState.variant === 'danger-outlined' && {
          borderRadius: '11px',
          padding: '8px 10px',
          color: `${theme.palette.danger.secondary}`,
          background: `${theme.palette.background?.contrastText}`,
          border: `1px solid ${theme.palette.danger.secondary}`,
        }),

        '&.Mui-disabled': {
          opacity: '0.3',

          ...(ownerState.variant === 'text' && {
            color: `${theme.palette[ownerState.color].main}`,
          }),

          ...(ownerState.variant === 'contained' && {
            background: `${theme.palette[ownerState.color].main}`,
          }),

          ...(ownerState.variant === 'outlined' && {
            color: `${theme.palette[ownerState.color].main}`,
            borderColor: `${theme.palette[ownerState.color].main}`,
          }),

          ...(ownerState.variant === 'danger' && {
            color: `${theme.palette.danger.secondary}`,
            borderColor: `${theme.palette.danger.secondary}`,
          }),
        },

        ...(ownerState.size === 'small' && {
          fontSize: '14px',
          lineHeight: '24px',
          padding: '5px 16px',
          gap: '4px',
          fontWeight: 600,

          '& .MuiButton-startIcon': {
            marginRight: 0,
          },
        }),

        ...(ownerState.size === 'medium' && {
          fontSize: '14px',
          lineHeight: '24px',
          padding: '7px 16px',
          gap: '4px',
          fontWeight: 600,

          '& .MuiButton-startIcon': {
            marginRight: 0,
          },
        }),

        ...(ownerState.size === 'large' && {
          fontSize: '14px',
          lineHeight: '24px',
          padding: '8px 16px',
          gap: '4px',
          fontWeight: 600,

          '& .MuiButton-startIcon': {
            marginRight: 0,
          },
        }),
      }),

      text: {
        padding: '0',
        background: 'transparent',

        '&:hover': {
          background: 'transparent',
        },
      },
    },
  };
}
