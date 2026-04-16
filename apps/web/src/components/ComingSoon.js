import Card , {CardHeader, CardContent} from './ui/Card.js';

export default function ComingSoon({
    icon = '🚀',
    title = 'Coming Soon',
    description = 'This feature is currently under devlopment',
    showCard = true,
}){

    const content = (
        <div className='text-center py-12'>
            <div className="text-6xl mb-4">{icon}</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">{title}</h4>
            <p className="text-gray-500 max-w-md mx-auto">
                {description}
            </p>
        </div>
    );

    if(showCard){
        return (
        <Card>
            <CardContent>
                {content}
            </CardContent>
        </Card>
        );    
    }

    return content;
}
