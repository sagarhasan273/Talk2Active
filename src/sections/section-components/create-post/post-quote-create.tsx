import { useFormContext } from 'react-hook-form';

import { Box, Chip, Card, Avatar, capitalize, Typography, CardContent } from '@mui/material';

import { PostTagsEnum } from 'src/enums/enum-post';

import { Field } from 'src/components/hook-form';

export function PostQuoteCreate({ currentUser }: { currentUser: any }) {
  const { watch } = useFormContext();
  const values = watch();
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent
        sx={{
          p: {
            xs: 1.5,
            sm: 2,
          },
        }}
      >
        <Box
          display="flex"
          sx={{
            gap: {
              xs: 1,
              sm: 2,
            },
          }}
          alignItems="flex-start"
        >
          <Avatar src={currentUser.avatar} alt={currentUser.name} />

          <Box sx={{ flexGrow: 1 }}>
            <Field.Text
              name="content"
              placeholder="What's inspiring you today? Share a quote, thought, or wisdom..."
              multiline
              rows={5}
              fullWidth
              autoFocus
              inputProps={{ maxLength: 280 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  p: 0,
                  borderRadius: 1,
                },
                '& .MuiOutlinedInput-input': {
                  padding: {
                    xs: 1,
                    sm: 2,
                  },
                  fontSize: {
                    xs: '0.775rem',
                    sm: '1rem',
                  },
                  borderRadius: 1,
                },
              }}
            />

            {/* Word count + helper */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Share something meaningful
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {values.content.length}/280
              </Typography>
            </Box>

            <Field.Text
              name="authorName"
              placeholder="Author name..."
              fullWidth
              inputProps={{ maxLength: 280 }}
              size="small"
              sx={{
                borderRadius: 1,
                '& .MuiOutlinedInput-input': {
                  fontSize: {
                    xs: '0.775rem',
                    sm: '1rem',
                  },
                  borderRadius: 1,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                you can skip if unknown
              </Typography>
            </Box>

            <Field.Autocomplete
              name="tags"
              placeholder="+ tags"
              multiple
              disableCloseOnSelect
              options={Object.values(PostTagsEnum).map((option) => option)}
              getOptionLabel={(option) => option}
              renderOption={(props, option) => (
                <li {...props} key={option}>
                  {capitalize(option)}
                </li>
              )}
              size="small"
              renderTags={(selected, getTagProps) =>
                selected.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option}
                    label={capitalize(option)}
                    size="small"
                    color="info"
                    variant="soft"
                  />
                ))
              }
              sx={{
                my: 2,
                '& .MuiOutlinedInput-input': {
                  fontSize: {
                    xs: '0.775rem',
                    sm: '1rem',
                  },
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
