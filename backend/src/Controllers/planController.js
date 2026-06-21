import Plan from '../Models/Plan.js';

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public or MasterAdmin
export const getPlans = async (req, res) => {
    try {
        const plans = await Plan.find({});
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a plan
// @route   POST /api/plans
// @access  Private/MasterAdmin
export const createPlan = async (req, res) => {
    try {
        const { planName, planPrice, description, features, isPopular, isRecommended, planType } = req.body;

        const plan = new Plan({
            planName,
            planPrice,
            description,
            features,
            isPopular,
            isRecommended,
            planType
        });

        const createdPlan = await plan.save();
        res.status(201).json(createdPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/MasterAdmin
export const updatePlan = async (req, res) => {
    try {
        const { planName, planPrice, description, features, isPopular, isRecommended, planType } = req.body;

        const plan = await Plan.findById(req.params.id);

        if (plan) {
            plan.planName = planName !== undefined ? planName : plan.planName;
            plan.planPrice = planPrice !== undefined ? planPrice : plan.planPrice;
            plan.description = description !== undefined ? description : plan.description;
            plan.features = features !== undefined ? features : plan.features;
            plan.isPopular = isPopular !== undefined ? isPopular : plan.isPopular;
            plan.isRecommended = isRecommended !== undefined ? isRecommended : plan.isRecommended;
            plan.planType = planType !== undefined ? planType : plan.planType;

            const updatedPlan = await plan.save();
            res.json(updatedPlan);
        } else {
            res.status(404).json({ message: 'Plan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/MasterAdmin
export const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (plan) {
            await Plan.deleteOne({ _id: plan._id });
            res.json({ message: 'Plan removed' });
        } else {
            res.status(404).json({ message: 'Plan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
