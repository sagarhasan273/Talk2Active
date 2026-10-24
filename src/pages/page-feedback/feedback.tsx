import FeedbackView from '@/sections/section-feedback/view/feedback-view';
import { Helmet } from 'react-helmet-async';

export const metadata = {
	title: 'Feedback | Talk2Active',
};

export default function FeedbackPage() {
	return (
		<>
			<Helmet>
				<title> {metadata.title}</title>
			</Helmet>
			<FeedbackView />
		</>
	);
}
