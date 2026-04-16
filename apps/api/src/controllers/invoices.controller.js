import { asyncHandler } from "../utils/asyncHandler";
import { UnauthorizedError } from "../utils/errors";

export const getInvoices  = asyncHandler(async (req ,res) => {
    const user_id = req.user.user_id;

    if(!user_id) return new UnauthorizedError('Permisssion is denied .');

    const {data , error} = await supabase.from('invoices').select('*').eq('user_id' , user_id).order('invoice_id', {ascending: true});
    
    if(error){
        return res.status(500).json({
            success : false,
            message: 'Failed to fetch invoices.',
            error : error.message
        });
    };

    res.status(200).json({
        success : true,
        message : 'Invoices fetched successfully.',
        data : data || []
    });
});